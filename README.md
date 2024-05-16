# BugCube project

## Installation

```
git clone https://github.com/it-and-software-solutions/bugcube
cd bugcube
```

### Pre-Install Setup

```
# Run `cat ./install_scripts/setup.sh` to list all global variables
# Check this file for all configuration variables
# Global variables start with the `BC_` prefix

# Put the path to the Publications folder here
export BC_BACKEND_DB="PATH/TO/Publications"

# Put the hostname of the SSL certificate here if it differs from `hostname -f`
export BC_BACKEND_HOSTNAME="current_hostname"

# For testing purposes only: To disable SSL
export BC_USE_SSL=false
# For production set it to true
export BC_USE_SSL=true
```


### Install script

`sudo -E bash ./install_scripts/install.sh`

### Update installation

If you want to redo the installation, just delete the `build` folder from the directory and rerun the installation.  
You would need to remove/update the external libraries nginx and nodejs via the system.
