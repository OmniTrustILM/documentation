    ---
sidebar_position: 4
---

# Network menu menu

The network menu allows you to configure several network parameters of the CZERTAINLY appliance; it offers the following options.

| Short name    | Main menu item                                                | Description                                                                              |
|---------------|---------------------------------------------------------------|------------------------------------------------------------------------------------------|
| **h**ostname  | [Configure hostname](#configure-hostname)                     | By default appliance uses czertainly.local.                                              |
| **n**etwork   | [Configure network parameters](#configure-network-parameters) | Allow to static network configuration, if needed.                                        |
| **p**roxyHTTP | [Configure HTTP proxy](#configure-http-proxy)                 | If your network policy requires using HTTP proxy you can configure it under this option. |
| **t**imeSync  | [Configure time parameters](#configure-time-parameters)       | Configure NTP time synchronization, if needed.                                           |

## Configure hostname

The option serves to change the hostname of the appliance. If change is needed, please provide a fully qualified name - the name with a domain, like *czertainly.example.com*.

After entering the new hostname, files `/etc/hosts` and `/etc/hostname` are overwritten with new values and the **Appliance is rebooted** to propagate the new hostname.

## Configure network parameters

The Appliance comes configured for using DHCP. If your network requires static configuration, you can configure it here.

In case you need a special network configuration, you need to first remove all X in the Network parameters dialog. With a completely empty setting, the installer scripts will not touch the system networking, and you can configure arbitrary parameters manually.

## Configure HTTP proxy

If your network policy requires using an HTTP proxy, you can configure it using this option. You will be prompted for `HTTP_PROXY`, `HTTPS_PROXY`, `FTP_PROXY`, `FTPS_PROXY` and `NOPROXY` settings after confirmation changes will be immediately propagated to the system.

Files `/etc/profile.d/proxy.sh`, `/etc/apt/apt.conf.d/80proxy`, `/etc/default/rke2-server` and `/etc/default/rke2-agent` are modified by this action.

Values you provided in this dialog are stored on the file system in: `/etc/czertainly-ansible/vars/proxy.yml`.

In case installing behind restrictive HTTP proxy make sure that you enable all hostnames holding resources needed for successful installation:
* **Debian packages**:
  * deb.debian.org
  * security.debian.org
* **CZERTAINLY resources**:
  * deb.czertainly.com
  * harbor.3key.company
* **Helm**:
  * baltocdn.com
  * github.com
  * release-assets.githubusercontent.com
* **Docker images**:
  * index.docker.io
  * auth.docker.io
  * production.cloudflare.docker.com
  * registry-1.docker.io
* **RKE2**:
  * get.rke2.io
  * update.rke2.io
* **local-path-provisioner**:
  * ^raw\.githubusercontent\.com$
  * ^docker-images-prod\..*\.cloudflarestorage\.com$
* **cert-manager**:
  * ^charts\.jetstack\.io$
  * ^quay\.io$
  * ^cdn.*\.quay\.io$

In [documentation on GitHub](https://github.com/CZERTAINLY/CZERTAINLY-Appliance/blob/develop/http-proxy.md#http-proxy) is provided a configuration snippet for Squid HTTP proxy..

:::warning
In case you are setting HTTP Proxy parameters before the first run of the installation. You need to close the actual terminal session and open a new one to reload environment variables from file `/etc/profile.d/proxy.sh`.

In case you need to change the HTTP Proxy parameters of an existing installation, you need first reboot the Appliance and, after that, execute the function "Install CZERTAINLY" from the main menu to get changes correctly propagated into the system, RKE2 and all CZERTAINLY PODs.
:::

## Configure time parameters

It is common that time is synchronized to hosts from Hypervisor, but in special cases might be useable to configure systemd-timesyncd inside of Virtual Appliance.

When you need to change the time zone, you can configure it here. Debian uses [TZ database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones). Use the right TZ Identifier, such as Europe/Prague or America/New_York.