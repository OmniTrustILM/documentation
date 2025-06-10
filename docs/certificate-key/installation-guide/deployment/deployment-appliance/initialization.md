---
sidebar_position: 3
---

# Initialization

To make the initial configuration of the virtual appliance, you must log into it using the default credentials:

* **username**: czertainly
* **password**: newgenerationtrustcare

To log in, you can use the virtual machine's console. Or you can use SSH, which offers higher user comfort like scrolling and easy copy & paste. When you are successfully logged in, you will see the Text-based User Interface ([**TUI**](./TUI/intro.md)) for managing the virtual appliance.

The following steps need to be done to initialize the virtual appliance.

:::warning[Mandatory steps]
Bold items are mandatory, even for testing purposes.
:::

1. [Change hostname and networking parameters](#change-hostname-and-networking-parameters)
1. [**Update the system**](#update-system-and-packages)
2. [Install hypervisor tools](#install-hypervisor-tools)
3. [Setup TLS certificate](#tls-certificate-for-czertainly-interface)
4. [Trusted certificate list](#trusted-certificates-list)
5. [Configure database](#database)
6. [Configure credentials to CZERTAINLY docker repository](#credentials-for-czertainly-docker-repository)
7. [**Configure CZERTAINLY**](#configure-czertainly)
8. [**Install CZERTAINLY**](#install-czertainly)

## Change hostname and networking parameters

By default, the virtual appliance is configured to use a dynamically assigned IP address from a DHCP server.

The default hostname is `czertainly`, and the domain is `local`, which may be useful for development and testing purposes. You need to add the name `czertainly.local` and VM IP into your [hosts
file](https://www.howtogeek.com/27350/beginner-geek-how-to-edit-your-hosts-file/). In production, you will need to set a hostname that will be configured in DNS. To do so, select **Main menu -> [Configure network parameters](./TUI/network-menu.md) -> [Configure hostname](./TUI/network-menu.md#configure-hostname)**.

By default, the appliance uses DHCP, no HTTP proxy and no NTP. If you need to change those parameters, you can use [network menu](./TUI/network-menu.md).

## Update system and packages

It is always good to have a current version of `czertainly-appliance-tools` and Debian software. To update packages, select **Advanced options -> Update Operating System** from the main menu.

## Install hypervisor tools

Depending on your hypervisor you might want to install its specific tools.

For VMware, it is good to install [open-vm-tools](https://packages.debian.org/bookworm/open-vm-tools). Select from the main menu **Advanced options -> Enter system shell** and type `sudo apt install open-vm-tools.

For Virtualbox, you do not have to install anything [virtualbox-guest-module](https://packages.debian.org/bookworm/virtualbox-guest-modules) that is already part of the running kernel image.

For other hypervisors, please consult their documentation.

## TLS certificate for CZERTAINLY interface

CZERTAINLY is controlled via a web interface. For testing purposes, a self-signed certificate is automatically generated. If you aim to put CZERTAINLY into production, you want to upload a certificate from your internal CA. To do so, select **Main menu -> [Configure ingress TLS certificates](./TUI/main-menu.md#configure-ingress-tls-certificates)**.

## Trusted certificates list

Access to the web interface of CZERTAINLY is authenticated by default by a client certificate.

:::info[Access control]
There are various options for configuring access control for the platform. See [Access control](../../../concept-design/architecture/access-control/overview) for more information.
:::

For testing purposes, you can use preconfigured [Dummy CA certificate](https://github.com/CZERTAINLY/CZERTAINLY-Helm-Charts/blob/master/dummy-certificates/certs/root-ca.cert.pem). In production system, you will need to replace this list with your own trusted CA certificates. To do this, select **Main menu -> [Configure custom trusted certificates](./TUI/main-menu.md#configure-custom-trusted-certificates)**.

## Database

CZERTAINLY persists all its data in the Postgres database. The server will be installed for you, but you might want to set your own password for the database. To do so, choose **[Configure database](./TUI/main-menu.md#configure-database)** from the **Main menu**.

## Credentials for CZERTAINLY docker repository (optional)

Credentials for private CZERTAINLY Docker repository are optional and typically not required. We are providing all necessary Docker containers in the public Docker repository `docker.io/czertainly`. Private Docker containers [hosted in a private Docker repository](../../../current-versions.md) `harbor.3key.company` are kept mainly for internal use and legacy purposes.

The credentials can be used also in case you would like to access your own private Docker repository where you store your own Docker containers.

:::warning[Obtain access to private Docker repository]
Ask [support](../../../../feedback-support.md) for credentials to access a private repository in case you believe you need access to legacy containers.
:::

To enter credentials for private repository, use option **Main Menu -> [Configure Docker repository access credentials](./TUI/main-menu.md#configure-docker-repository-access-credentials)**.

## Configure CZERTAINLY

Option **[Configure CZERTAINLY](./TUI/main-menu.md#configure-czertainly)** of the main menu opens a dialog where you can choose the version of CZERTAINLY and its components you want to install.

## Install CZERTAINLY

When you select **[Install CZERTAINLY](./TUI/main-menu.md#install-czertainly)** from the main menu, the installation will begin after confirmation.

:::info[Installation time]
Complete installation takes about 10 minutes on a decent system with good internet access. The most time-consuming part is downloading Docker images that are deployed in the cluster.
:::

After successful installation, the administrator web interface is available at the address:
```
https://[hostname]/administrator/
```
where `hostname` is the value configured in the previous step. For logging into the web interface you can use:
  * the [dummy administrator certificate](https://github.com/CZERTAINLY/CZERTAINLY-Helm-Charts/blob/master/dummy-certificates/private/admin.p12) which is preconfigured for testing purposes, it has password `00000000` or,
  * the username / password provided at the beginning of the page (if you installed Keycloak).
