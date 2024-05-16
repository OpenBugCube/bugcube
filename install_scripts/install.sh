if [[ ${USER} != root ]]
then
	echo "This scripts needs to be run as root"
	exit 1
fi

MYDIR="$(dirname "$(realpath "$0")")"

### Install libarchive (ubuntu)

#sudo -E bash ${MYDIR}/libarchive.sh

### Install nginx (ubuntu)

#sudo -E bash ${MYDIR}/nginx.sh

### Install local user

#sudo -E bash ${MYDIR}/local_user.sh

### Install BugCube-Backend

sudo -E su ${SUDO_USER} -c "bash ${MYDIR}/backend.sh"
exit 1

### Install nodejs (ubuntu)

sudo -E bash ${MYDIR}/nodejs.sh

### Install BugCube-Frontend

sudo -E su ${SUDO_USER} -c "bash ${MYDIR}/frontend.sh"

### Install services

sudo -E bash ${MYDIR}/install_service.sh

