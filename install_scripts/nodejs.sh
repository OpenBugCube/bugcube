# Author: Markus Stabrin
# Contact: it@markus-stabrin.de
# Github: mstabrin

# Installs nodejs if not already installed.

MYDIR="$(dirname "$(realpath "$0")")"

# Variables starting with "BC_" are loaded from setup
source ${MYDIR}/setup.sh

if ! which node
then
	apt-get update
	apt-get install -y ca-certificates curl gnupg
	mkdir -p /etc/apt/keyrings
	curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

	NODE_MAJOR=${BC_NODE_MAJOR:-20}
	echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list

	sudo apt-get update
	sudo apt-get install nodejs -y
else
	echo "Node already installed! $(nodejs --version)"
fi
