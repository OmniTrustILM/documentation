---
sidebar_position: 6
---

# Upgrading

:::warning
Before any upgrade, make sure you have a recent snapshot first!
:::

## OS packages upgrades

ILM Virtual Appliance is based on Debian GNU/Linux. To upgrade it [enter system shell](./TUI/advanced-menu.md#enter-system-shell), and execute command `sudo apt update && sudo apt upgrade`. This command also upgrades `ilm-appliance-tools` package, this package provides [TUI](./TUI/intro.md), it is necessary to close the open shell connection and login back to start using the new version of the TUI.

The above command first updates information about package versions and the second upgrades them. This way is safe from major upgrades and should be done periodically.

## OS upgrades

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

## Kubernetes upgrades

ILM Virtual Appliance is using [RKE2](https://docs.rke2.io/) as Kubernetes distribution, latest version can be checked in their [Relase Notes](https://docs.rke2.io/release-notes/v1.31.X). The actual running version on Appliance can be checked by the shell command `kubectl version`. Example output:
```bash
$ kubectl version
Client Version: v1.28.11+rke2r1
Kustomize Version: v5.0.4-0.20230601165947-6ce0bf390ce3
Server Version: v1.28.11+rke2r1
```

To upgrade RKE2 on the Appliance visit file `/etc/ilm-ansible/playbooks/ilm.yml` adjust `rke2_version` and set `rke2_allow_upgrade: true`. After saving exec "Install ILM" from the main menu. Wait untill the process completes.

The file `/etc/ilm-ansible/playbooks/ilm.yml` contains also variables:
  * `helm_version`
  * `helm_diff_version`
  * `rke2_certmanager_version`
  * `ilm_cbom_repository_version`

By changing these variables, you can control the versions of the respective components used during the ILM installation or upgrade process.

## ILM upgrade

It is possible to upgrade reasonably old versions of ILM just by raising the version number in [ILM configuration](./TUI/main-menu.md#configure-ilm) and executing [ILM Installation](./TUI/main-menu.md#install-ilm). It is posible even upgrade to ILM version which exceedes version of ilm-appliance-tools and version if the Appliance itself. But before doing so it is recommended to check official [upgrade instructions](../deployment-helm/upgrading) for upgrade path for your specific version.


We strongly recommend first performing [OS packages upgrades](#os-packages-upgrades) to upgrade OS components and to get the latest version of [ILM Appliance Tools](#versioning). If you upgrade the Tools first you get support for all new ILM components directly in TUI.

### To 2.19.0

In version 2.18.0 of ILM we changed trusted root CA and renaming continued. Please check official [Helm upgrade notes](https://docs.otilm.com/docs/certificate-key/installation-guide/deployment/deployment-helm/upgrading) alongside [upgrading instruction](https://github.com/OmniTrustILM/appliance/blob/develop/upgrading2-2.19.0.md) for the Appliance.

### To 2.17.0

Between version 2.16.0 and 2.17.0, we renamed from CZERTAINLY to ILM, so the paths of configuration files and home directory of the user were changed. We also used never base image for the appliance. If you are migrating from version 2.16.0 or older, make sure to copy files from the right paths. Detailed [instructions for upgrading](https://github.com/OmniTrustILM/appliance/blob/develop/upgrading2-2.17.0.md) are available on GitHub.
