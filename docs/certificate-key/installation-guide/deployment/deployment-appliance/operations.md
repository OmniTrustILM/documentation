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

:::warning
Before any upgrade, make sure you have a recent snapshot first!
:::

#### OS packages upgrades

ILM Virtual Appliance is based on Debian GNU/Linux. To upgrade it [enter system shell](./TUI/advanced-menu.md#enter-system-shell), and execute command `sudo -i apt update && sudo -i apt upgrade`. This command also upgrades `ilm-appliance-tools` package, this package provides [TUI](./TUI/intro.md), it is necessary to close the open shell connection and login back to start using the new version of the TUI.

The above command first updates information about package versions and the second upgrades them. This way is safe from major upgrades and should be done periodically.

#### OS upgrades

The upgrade of the OS can cause downtime and can introduce dependency problems with the ILM platform. Always check our site first before trying to do the OS upgrade.

The new major version of the Debian system is released every 2 years and has [LTS support](https://wiki.debian.org/LTS) lasting typically 5 years in total. It is perfectly safe to operate the ILM platform on an older version of the Debian OS until the end of its LTS support.

The Debian Operating System is designed to support upgrades between major versions by `apt dist-upgrade`, however, we recommend to rather use a new version of ILM Virtual Appliance.

The following table shows which versions of Virtual Appliance are based on which version of Debian OS.

| Appliance version  | Debian version | LTS support end date |
|--------------------|----------------|----------------------|
| upto 2.10          |  Bullseye (11) | 2026-08-31           |
| from 2.11 to 2.16.0|  Bookworm (12) | 2028-06-30           |
| from 2.17.0        |  Trixie (13)   | 2030-06-30           |

Rather than upgrading OS on the existing appliance, we recommend to deploy a new version of the appliance and migrate ILM to it. This way you can be sure that all components are working correctly and you can easily rollback to the old appliance in case of any problem. In this case you follow this steps:
 * [backup](#backup) ILM database,
 * deploy new appliance and [upgrade OS](#os-upgrades),
 * migrate configuration of ILM components by copying files from `/etc/ilm-ansible/vars/` to the new appliance (before version 2.17.0 it is `/etc/czertainly-ansible/vars/`),
 * copy home directory of `ilm` user from old appliance to the new one (before version 2.17.0 it is `czertainly` user),
 * [restore](#restore) database (see below),
 * re-run ILM installation from the main menu.

:::info
Between version 2.16.0 and 2.17.0, we renamed from CZERTAINLY to ILM, so the paths of configuration files and home directory of the user were changed. If you are migrating from version 2.16.0 or older, make sure to copy files from the right paths. Detailed [instructions for upgrading](https://github.com/OmniTrustILM/appliance/blob/develop/upgrading2-2.17.0.md) are available on GitHub.
:::

#### Kubernetes upgrades

ILM Virtual Appliance is using [RKE2](https://docs.rke2.io/) as Kubernetes distribution, latest version can be checked in their [Relase Notes](https://docs.rke2.io/release-notes/v1.31.X). The actual running version on Appliance can be checked by the shell command `kubectl version`. Example output:
```bash
$ kubectl version
Client Version: v1.28.11+rke2r1
Kustomize Version: v5.0.4-0.20230601165947-6ce0bf390ce3
Server Version: v1.28.11+rke2r1
```

To upgrade exec "Install ILM" from the main menu. This will download the a version of the RKE2 installer, which you can see in the Ansible output:
```
TASK [rke2 : download rke2 installer] ******************************************
changed: [localhost]
```
Exec installer from shell command `sudo -i /usr/local/bin/rke2-install.sh`, example output:
```
$ sudo -i /usr/local/bin/rke2-install.sh
[sudo] password for ilm:
[INFO]  finding release for channel stable
[INFO]  using v1.30.4+rke2r1 as release
[INFO]  downloading checksums at https://github.com/rancher/rke2/releases/download/v1.30.4+rke2r1/sha256sum-amd64.txt
[INFO]  downloading tarball at https://github.com/rancher/rke2/releases/download/v1.30.4+rke2r1/rke2.linux-amd64.tar.gz
[INFO]  verifying tarball
[INFO]  unpacking tarball file to /usr/local
```
This downloads and deploys a new version of RKE2. Next, you need to restart RKE2. Exec `sudo systemctl restart rke2-server.service` and finally verify that Kubernetes was upgraded:

```bash
$ kubectl version
Client Version: v1.30.4+rke2r1
Kustomize Version: v5.0.4-0.20230601165947-6ce0bf390ce3
Server Version: v1.30.4+rke2r1
```
#### ILM upgrade

It is possible to upgrade ILM just by raising the version number in [ILM configuration](./TUI/main-menu.md#configure-ilm) and executing [ILM Installation](./TUI/main-menu.md#install-ilm). It should work for upgrades from version 2.8.0 upwards.

We strongly recommend first performing [OS packages upgrades](#os-packages-upgrades) to upgrade OS components and to get the latest version of [ILM Appliance Tools](#versioning). If you upgrade the Tools first you get support for all new ILM components directly in TUI.

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
