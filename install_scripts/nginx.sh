if ! which nginx
then
	apt install nginx -y
else
	echo "NGINX already installed"
	nginx -v
fi
