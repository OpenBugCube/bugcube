# Author: Markus Stabrin
# Contact: it@markus-stabrin.de
# Github: mstabrin

# Installs the created services for frontend and backend and restarts the systemd services.

MYDIR="$(dirname "$(realpath "$0")")"

# Variables starting with "BC_" are loaded from setup
source ${MYDIR}/setup.sh

for file_name in ${BC_CONFIG_FOLDER}/*.service 
do
	rm -f /etc/systemd/system/$(basename ${file_name})
	ln -rs ${file_name} /etc/systemd/system
	systemctl daemon-reload
	systemctl enable --now $(basename ${file_name})
	systemctl restart $(basename ${file_name})
done

rm -f /etc/nginx/sites-enabled/default

for file_name in ${BC_CONFIG_FOLDER}/*.site
do
	rm -f /etc/nginx/sites-enabled/$(basename ${file_name})
	ln -rs ${file_name} /etc/nginx/sites-enabled/
done
systemctl restart nginx
