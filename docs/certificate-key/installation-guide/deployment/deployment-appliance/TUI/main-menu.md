---
sidebar_position: 3
---

# Main menu

The main menu allows you to select and execute basic tasks on the ILM appliance; it offers the following options.

| Short&nbsp;name | Main&nbsp;menu&nbsp;item                                                                          | Description                                                                         |
|-----------------|---------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| **n**etwork     | [Configure network parameters](./network-menu.md)                                                 | It opens another menu which allows the setting of different networking parameters.  |
| **i**ngressTLS  | [Configure ingress TLS certificates](#configure-ingress-tls-certificates)                         | Custom HTTPS certificates for ILM web interface can be configured here.             |
| **t**rustedCA   | [Configure custom trusted certificates](#configure-custom-trusted-certificates)                   | Use this option to change the default list of trusted certificates of ILM.          |
| **p**ostgres    | [Configure database](#configure-database)                                                         | You can change the default configuration of the Postgres database with this option. |
| **d**ockerRepo  | [Configure Docker repository access credentials](#configure-docker-repository-access-credentials) | Configure credentials for Licensed parts of ILM here.                               |
| **m**ail        | [Configure email server parameters](#configure-email-server-parameters)                           | Parameters of email server are needed for sending notifications.                    |
| **c**onfig      | [Configure ILM](#configure-ilm)                                                                   | Use this option to select the version and components of ILM to install.             |
| **i**nstall     | [Install ILM](#install-ilm)                                                                       | Execute ILM installation.                                                           |
| **s**tatus      | [Show ILM status](#show-ilm-status)                                                               | This option will show the status of ILM and Kubernetes subsystem.                   |
| **a**dvanced    | [Advanced options](./advanced-menu.md)                                                            | Opens another menu with advanced options of ILM appliance.                          |
| **e**xit        | Exit ILM manager                                                                                  | Closes TUI and disconnects from ILM appliance.                                      |

## Configure ingress TLS certificates

This option provides an interface for setting your own certificates for the ILM web interface. After selecting it, TUI will open a dialog with two input fields, the first for a filename containing a certificate and the second one for a private key.

Use `scp` command, or any other favourite tool, to copy the certificate and the key to the appliance:

```
scp certificate.crt ilm@ilm.local:
scp key.pem ilm@ilm.local:
```

Both files are copied into the home directory of `ilm` user. Please provide full paths into the input fields of the dialog. In the example above, full paths are `/home/ilm/certificate.crt` and `/home/ilm/key.pem`.

Values you provided in this dialog are stored on the file system in:
`/etc/ilm-ansible/vars/ingress.yml`.

## Configure custom trusted certificates

To replace the default list of trusted certificates of ILM, please upload a file containing a list of trusted certificates to the appliance by `scp` command or any other favourite tool:

```
scp trusted-list.pem ilm@ilm.local:
```

Provide the full path to the uploaded file in the input field in dialog; in the above example, it is `/home/ilm/trusted-list.pem`.

Values you provided in this dialog are stored on the file system in: `/etc/ilm-ansible/vars/trustedCA.yml`.

## Configure database

You can change the default parameters for the Postgres database here. The password is the field you definitely should change.

By default, ILM uses the Debian repository, where there is always only one version of PostgreSQL available; we recommend leaving repository settings on value `debian`. In special cases, setting it to `official` allows you to choose more than a single version. For more details, see [official PostgreSQL wiki](https://wiki.postgresql.org/wiki/Apt).

Values you provided in this dialog are stored on the file system in: `/etc/ilm-ansible/vars/database.yml`.

## Configure Docker repository access credentials

Licensed parts of ILM are hosted on a private Docker repository named `harbor.3key.company`. Use this dialog to provide your *username* and *password* you have received from [support](/docs/feedback-support/).

Values you provided in this dialog are stored on the file system in: `/etc/ilm-ansible/vars/docker.yml`.

## Configure email server parameters

You have to provide the parameters of the email server. Depending on your company policy, the hostname of a mail server and a port number might be sufficient. Dialog also offers you the chance to configure username, password, and TLS usage to authenticate the email server if needed.

## Configure ILM

In this dialog window, you can select which version and which components of ILM you want to install.

#### Version

List [available versions](https://harbor.3key.company/harbor/projects/8/repositories/czertainly/artifacts-tab). The latest stable version is typically the best choice, and it is pre-selected in the appliance.

#### Components

List of ILM components to be installed. By default, all parts are marked for installation. If you have not provided credentials for the docker private repository, the installation of private components **will fail**. For a successful installation, uncheck them (remove the 'X' character in the small input box next to the component name) or [configure credentials to ILM docker repository](#configure-docker-repository-access-credentials).

Values you provided in this dialog are stored on the file system in: `/etc/ilm-ansible/vars/ilm.yml`.

## Install ILM

This option executes ILM installation. During the process, output from installation steps is displayed. In case something fails, the content of `/var/log/ansible.log` will be useful for debugging and sharing with [support](/docs/feedback-support/).

## Show ILM status

This option printout simple status information about ILM and the underlying Kubernetes cluster, for example:

```
kube-system     11 PODs OK
cert-manager     3 PODs OK
ilm             13 PODs OK


Everything is OK, administrative interface is available at:

https://ilm.local/administrator/


press enter to return into menu
```
