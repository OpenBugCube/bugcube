MYDIR="$(dirname "$(realpath "$0")")"

# Variables starting with "BC_" are loaded from setup
source ${MYDIR}/setup.sh

if ! id ${BC_SERVICE_USER}
then
	adduser ${BC_SERVICE_USER} --disabled-password --disabled-login --gecos ""
else
	echo "ServiceUser already exists!"
fi
