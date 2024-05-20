# Author: Markus Stabrin
# Contact: it@markus-stabrin.de
# Github: mstabrin

# Installs nginx if not already installed.

if ! which nginx
then
	apt install nginx -y
else
	echo "NGINX already installed"
	nginx -v
fi
