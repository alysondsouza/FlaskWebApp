# FlaskWebApp

This repository contains the setup for a Flask web application with a PostgreSQL backend, configured to run on separate Multipass instances.

## Setup Instructions

### Prerequisites
- Install [Multipass](https://multipass.run/docs/installing-on-windows) and [VirtualBox](https://www.oracle.com/virtualization/technologies/vm/downloads/virtualbox-downloads.html).
- Set the `VBOX_MSI_INSTALL_PATH` environment variable to the path where VirtualBox is installed.
- Download and setup [PsExec](https://docs.microsoft.com/en-us/sysinternals/downloads/psexec)
- Create a [cloud-init](https://github.com/alysondsouza/FlaskWebApp/blob/main/playbooks/cloud_init.yaml) file locally to setup SSH Key.
- Create folder `C:\mnt\` for sharing files between Multipass instances, [mount](https://multipass.run/docs/share-data-with-an-instance).

## Multipass Instances Setup
```
multipass launch -n apache --network Wi-Fi --cloud-init cloud_init.yaml --mount C:\mnt\:/mnt/
```
```
multipass launch -n psql --network Wi-Fi --cloud-init cloud_init.yaml --mount C:\mnt\:/mnt/
```

## APACHE

SSH into the Apache instance:
```
multipass shell apache
```

Install Ansible and clone the FlaskWebApp repository:
```
sudo apt install ansible -y
git clone https://github.com/alysondsouza/FlaskWebApp.git
```

Run the Ansible playbooks:
```
ansible-playbook FlaskWebApp/playbooks/gitProjectSetup.yaml
ansible-playbook /var/www/playbooks/installApache.yaml
ansible-playbook /var/www/playbooks/configurationApache.yaml
ansible-playbook /var/www/playbooks/serviceFlask.yaml
```
A new port can be assigned if necessary: <br>
ansible-playbook /var/www/playbooks/configurationApache.yaml -e "app_port=8000"


Multipass Portforwarding | PowerShell (Administrator):
```
& $env:USERPROFILE\Downloads\PSTools\PsExec.exe -s $env:VBOX_MSI_INSTALL_PATH\VBoxManage.exe controlvm "apache" natpf1 "myservice,tcp,127.0.0.1,5000,,5000"
```

The Flask application will be accessible at:
```
http://127.0.0.1:5000/
```

Logs:
```
journalctl -u flask.service -f
```

## POSTGRES

SSH into the PostgreSQL instance:
```
multipass shell psql
```

Install Ansible and clone the FlaskWebApp repository:
```
sudo apt install ansible -y
git clone https://github.com/alysondsouza/FlaskWebApp.git
```

Run the Ansible playbooks to set up PostgreSQL and pgAdmin:
```
ansible-playbook FlaskWebApp/playbooks/gitClonePlaybooks.yaml
ansible-playbook playbooks/installPgAdmin.yaml
ansible-playbook playbooks/createDatabase.yaml
```

pgAdmin will be accessible at:
```
http://<psql_instance_ip>/pgadmin4
```

Use the following credentials to log into pgAdmin and the database:

pgAdmin credentials:
* Email: psql@psql.com
* Password: 123456

Database connection details:
* Host: <psql_instance_ip>
* Port: 5432
* Username: postgres
* Password: 123456
