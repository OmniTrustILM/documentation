---
sidebar_position: 5
---

# Operations

The following document describes advanced operations for the management of virtual appliance:
- [Virtual appliance management](#virtual-appliance-management)
- [User management](#user-management)
- [Advanced tasks](#advanced-tasks)

## Virtual appliance management

### Shut down

To shut down the virtual appliance use ACPI shutdown call of your virtualization platform or select **Advanced options -> Shutdown system**.

### Restart

To restart the virtual appliance, select **Advanced options -> Reboot system**. Do not use cold reboot function on your virtualization platform, as it could lead to file-system corruption.

### Update system

Updating of the virtual appliance system consists of updating and upgrading included packages, it can be easily done by selecting **Advanced options -> Update Operating System** from the menu.

## User management

### Create new user

To create user with username `john`, execute the following commands:
```bash
sudo adduser john
```

Then you will be requested to fill in user details:
```bash
ilm@ilm:~$ sudo adduser john
[sudo] password for ilm:
Adding user `john' ...
Adding new group `john' (1001) ...
Adding new user `john' (1001) with group `john' ...
Creating home directory `/home/john' ...
Copying files from `/etc/skel' ...
New password:
Retype new password:
passwd: password updated successfully
Changing the user information for john
Enter the new value, or press ENTER for the default
        Full Name []: John Doe
        Room Number []:
        Work Phone []:
        Home Phone []:
        Other []:
Is the information correct? [Y/n]
```

### Grant user admin privileges

To grant user admin privileges, execute the following command:
```bash
sudo adduser john sudo
```

### Change user password

To change password of another user `john`, execute the following command:
```bash
sudo passwd john
```

### Delete user

To delete user, execute the following command:
```bash
sudo deluser john
```

### Remove user admin privileges

To remove admin privileges for user, execute the following command:
```bash
sudo deluser john sudo
```

## Advanced tasks

### Custom Helm chart values

The installation/upgrade process of ILM is managed by the [Helm](https://helm.sh/).

If you need to provide your own custom Helm chart values that are not available through the [TUI](./TUI/intro.md), you need to access the shell of the appliance, create file `/home/ilm/values.custom.yaml`, and put it there.

The custom values overwrite the default values during the installation/upgrade process.

### Versioning

There are three version numbers which are related to ILM Virtual Appliance.

First, there is a version of **ILM Appliance** which is recorded in the file `/etc/appliance_version`. The appliance version provides a clue to Debian which was used as a base for the Appliance. This is also why this number is not changed during upgrades.

Next, we have a version of **ILM Appliance Tools**. Tools are the core of the Appliance, they come with Ansible Playbooks, Roles and TUI. The tools are distributed as a Debian package and actually instaled version can be displayed by the command `apt -q show ilm-appliance-tools`. It is perfectly OK to have a higher version of the Tools than of the Appliance, it is the right way how to get new versions of ILM itself to the Appliance.

And finally, there is a version of **ILM**. Which itself breaks into several components with their [independent versioning](../../../current-versions), but the main version is defined by the version of the Core and the Helm Chart. You can learn a version of the Helm Chart by running `helm -n ilm list`.

For your convenience, we provide the script `ilm-versions --detailed` which displays a list of all relevant versions for your ILM.

### Upgrading

Upgrading process of appliance consits of several steps:
1. [OS packages upgrades](./upgrading.md#os-packages-upgrades)
2. [OS upgrades](./upgrading.md#os-upgrades)
3. [Kubernetes upgrades](./upgrading.md#kubernetes-upgrades)
4. [ILM upgrade](./upgrading.md#ilm-upgrade)


### Backup

We suggest to setup periodical snapshoting/backup task of complete appliance on your virtual server platform.

Minimum backup consist:
* `/home/ilm`
* `/etc/ilm-ansible/vars/`
* database dump:
 ```
 (sudo -u postgres -- pg_dump ilmdb) > ilmdb-`date +"%Y-%m-%d-%H:%M:%S"`.dump.sql
 ```

### Restore

This method is intended mainly for migrating ILM from one Appliance to another Appliance, for example when changing a major version of Debian.

First, do a Backup on the old ILM Appliance as described above.

Start a brand new instance of Appliance, [upgrade OS](#os-upgrades).

Extract backups of `/home/ilm` and `/etc/ilm-ansible/vars/`.

Execute [Install ILM](TUI/main-menu.md#install-ilm) from the main menu. This will install a completely new ILM based on your settings.

Stop Kubernetes:
```
sudo systemctl stop rke2-server.service
sudo systemctl stop kubepods.slice
```

Delete new empty Postgres database:
```
echo "DROP DATABASE ilmdb;" | sudo -u postgres psql
```

Restore the ILM database and populate it with data from your backup:
```
export ANSIBLE_CONFIG=/etc/ilm-ansible/ansible.cfg
sudo /usr/bin/ansible-playbook /etc/ilm-ansible/playbooks/ilm.yml -t postgress
cat /home/ilm/ilmdb-<YYYY-DD-MM-HH:MM:SS>.dump.sql | sudo -u postgres psql ilmdb
```

Start Kubernetes:
```
sudo systemctl start kubepods.slice
sudo systemctl start rke2-server.service
```

Give it several minutes to start and examine the status of ILM by command `ilm-status`.
