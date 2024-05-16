MYDIR="$(dirname "$(realpath "$0")")"

# Variables starting with "BC_" are loaded from setup
source ${MYDIR}/setup.sh

NGINX_CONFIG=${BC_CONFIG_FOLDER}/nginx_frontend.site
BUILD_FOLDER=${BC_MAIN_DIR}/build/frontend
FRONTEND_BASE="${BC_FRONTEND_PATH}"

mkdir -p ${BUILD_FOLDER}

cd ${FRONTEND_BASE}
if [[ -z ${BC_USE_SSL} || ${BC_USE_SSL} == false ]]
then
	backend_prefix='http://'
else
	backend_prefix='https://'
fi
app_file=src/components/App/App.tsx
sed -i "s|XXX_BACKEND_IP_XXX|${backend_prefix}${BC_BACKEND_HOSTNAME}|g" ${app_file}
sed -i "s|XXX_BACKEND_PORT_XXX|${BC_BACKEND_PORT}|g" ${app_file}
npm install
rm -rf build
npm run build
rm -rf ${BUILD_FOLDER}/*
cp -R dist/* ${BUILD_FOLDER}
git checkout -- ${app_file}
cd -


if [[ -z ${BC_USE_SSL} || ${BC_USE_SSL} == false ]]
then

    cat << EOF > ${NGINX_CONFIG}
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name ${BC_BACKEND_HOSTNAME};

    root ${BUILD_FOLDER};
}
EOF

else

    cat << EOF > ${NGINX_CONFIG}
server {
    server_name ${BC_BACKEND_HOSTNAME};

    listen 80;
    listen [::]:80;

    return 301 https://\$server_name:\$request_uri;

}

server {
    listen 443 ssl;

    server_name ${BC_BACKEND_HOSTNAME};

    root ${BUILD_FOLDER};

    ssl_certificate /etc/letsencrypt/live/${BC_BACKEND_HOSTNAME}/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/${BC_BACKEND_HOSTNAME}/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

    error_page 497 301 =307 https://\$server_name:\$request_uri;

}
EOF

fi
