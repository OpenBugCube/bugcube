# Author: Markus Stabrin
# Contact: it@markus-stabrin.de
# Github: mstabrin

#Installs the python backend based on fastapi and gunicorn.  
#Runs a conda installation if not available and creates a new virtual environment in it. Installs the backend inside of the python environment.
#
#Additionally, the bugcube backend config, gunicorn config and the systemd service file is created.
#
#The NGINX config will also be created with or without SSL based on the `BC_USE_SSL` variable.

MYDIR="$(dirname "$(realpath "$0")")"

# Variables starting with "BC_" are loaded from setup
source ${MYDIR}/setup.sh

BUILD_FOLDER=${BC_MAIN_DIR}/build/backend
OUTPUT_WGET=${BUILD_FOLDER}/Miniconda3.sh
CONDA_DIR=${BUILD_FOLDER}/miniconda3
RUN_FOLDER=${BUILD_FOLDER}/run
GUNICORN_CONFIG=${BC_CONFIG_FOLDER}/gunicorn_conf.py
NGINX_CONFIG=${BC_CONFIG_FOLDER}/nginx_backend.site
GUNICORN_SOCKET=${RUN_FOLDER}/gunicorn.sock
ENV_FILE=${BC_CONFIG_FOLDER}/backend.env
SERVICE_FILE=${BC_CONFIG_FOLDER}/bugcube_backend.service
BACKEND_BASE=${BC_BACKEND_PATH}
ENV_NAME=bugcube_backend
ENV_DIR=${CONDA_DIR}/envs/${ENV_NAME}

mkdir -p ${BUILD_FOLDER}
mkdir -p ${BC_CONFIG_FOLDER}
mkdir -p ${RUN_FOLDER}
chmod 777 ${RUN_FOLDER}

if [[ ! -d ${CONDA_DIR} ]]
then
	wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ${OUTPUT_WGET}

	bash ${OUTPUT_WGET} -b -p ${CONDA_DIR}
	${CONDA_DIR}/bin/conda install -n base -c conda-forge mamba -y
fi

if [[ ! -d ${ENV_DIR} ]]
then
	${CONDA_DIR}/bin/mamba env create -n ${ENV_NAME} -f ${BACKEND_BASE}/conda_env.yml
fi

set -x
cd ${BACKEND_BASE}
${ENV_DIR}/bin/pip install .
set +x
cd -

cat << EOF > ${GUNICORN_CONFIG}
# https://www.vultr.com/de/docs/how-to-deploy-fastapi-applications-with-gunicorn-and-nginx-on-ubuntu-20-04/
import os
from multiprocessing import cpu_count

RUN_DIR = "${RUN_FOLDER}"

# Socket Path
bind = f"unix:${GUNICORN_SOCKET}"

# Worker Options
workers = cpu_count() + 1
worker_class = "uvicorn.workers.UvicornWorker"
timeout = 120

# Logging Options
loglevel = "debug"
accesslog = f"{RUN_DIR}/access_log"
errorlog = f"{RUN_DIR}/error_log"

os.environ["ENV_FILE"] = "${ENV_FILE}"
EOF


cat << EOF > ${SERVICE_FILE}
[Unit]
Description=Gunicorn Daemon for FastAPI BugCube application

[Service]
User=${BC_SERVICE_USER}
Group=www-data
WorkingDirectory=${RUN_DIR}
ExecStart=${ENV_DIR}/bin/gunicorn -c ${GUNICORN_CONFIG} bugcube_backend._api:app

[Install]
WantedBy=multi-user.target
EOF


cat << EOF > ${ENV_FILE}
PORT=${BC_BACKEND_PORT}
DB_DIR="${BC_BACKEND_DB}"
THUMBNAIL_SIZE_X=140
THUMBNAIL_SIZE_Y=600
ORIGINS=[${BC_BACKEND_ORIGINS}]
EOF


if [[ -z ${BC_USE_SSL} || ${BC_USE_SSL} == false ]]
then
    cat << EOF > ${NGINX_CONFIG}
server {
	server_name ${BC_BACKEND_HOSTNAME};

	proxy_set_header        X-Real-IP       \$remote_addr;
	proxy_set_header        X-Forwarded-For \$proxy_add_x_forwarded_for;
	proxy_set_header        Host            \$host;

	# Redirecto to gunicorn website
	location / {
		proxy_pass http://unix:${GUNICORN_SOCKET};
	}

	listen ${BC_BACKEND_PORT};
}
EOF

else
    cat << EOF > ${NGINX_CONFIG}
server {
	server_name ${BC_BACKEND_HOSTNAME};

	proxy_set_header        X-Real-IP       \$remote_addr;
	proxy_set_header        X-Forwarded-For \$proxy_add_x_forwarded_for;
	proxy_set_header        Host            \$host;

	# Redirecto to gunicorn website
	location / {
		proxy_pass http://unix:${GUNICORN_SOCKET};
	}

	listen ${BC_BACKEND_PORT} ssl;
	ssl_certificate /etc/letsencrypt/live/${BC_BACKEND_HOSTNAME}/fullchain.pem; # managed by Certbot
	ssl_certificate_key /etc/letsencrypt/live/${BC_BACKEND_HOSTNAME}/privkey.pem; # managed by Certbot
	include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
	ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

	error_page 497 301 =307 https://$server_name:$server_port$request_uri;

}
EOF

fi
