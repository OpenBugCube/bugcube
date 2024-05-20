# Author: Markus Stabrin
# Contact: it@markus-stabrin.de
# Github: mstabrin

# Variables used in the installation process.

set -x
export BC_MAIN_DIR=$(realpath ${BC_MAIN_DIR:-"."})
export BC_CONFIG_FOLDER=${BC_CONFIG_FOLDER:-${BC_MAIN_DIR}/build/config}
export BC_SERVICE_USER=${BC_SERVICE_USER:-"bugcube_service"}
export BC_BACKEND_PATH=${BC_BACKEND_PATH:-"${BC_MAIN_DIR}/backend"}
export BC_FRONTEND_PATH=${BC_FRONTEND_PATH:-"${BC_MAIN_DIR}/frontend"}
export BC_BACKEND_DB=${BC_BACKEND_DB:-"/db"}
export BC_BACKEND_PORT=${BC_BACKEND_PORT:-"3001"}
export BC_BACKEND_HOSTNAME=${BC_BACKEND_HOSTNAME:-$(hostname -f)}
export BC_BACKEND_ORIGINS=${BC_BACKEND_ORIGINS:-"\"*\""}
export BC_NODE_MAJOR=${BC_NODE_MAJOR:-20}
export BC_USE_SSL=${BC_USE_SSL:-true}
set +x
