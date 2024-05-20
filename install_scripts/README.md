# Installation scripts


## setup.sh


Variables used in the installation process.


## install.sh


Default installation procedure for a standalone installation on a new debian-based server.


## libarchive.sh


Installs the libarachive-dev package.


## nginx.sh


Installs nginx if not already installed.


## local_user.sh


Creates a new service user if not already available which will run the frontend and backend and does not have a login.


## backend.sh


Installs the python backend based on fastapi and gunicorn.  
Runs a conda installation if not available and creates a new virtual environment in it. Installs the backend inside of the python environment.

Additionally, the bugcube backend config, gunicorn config and the systemd service file is created.

The NGINX config will also be created with or without SSL based on the `BC_USE_SSL` variable.


## nodejs.sh


Installs nodejs if not already installed.


## frontend.sh


Installs the React frontend.

It inserts the IP and port of the backend into the app and builds the application.
Additionally, the NGINX config is created.


## install_service.sh


Installs the created services for frontend and backend and restarts the systemd services.
