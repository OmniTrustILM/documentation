---
sidebar_position: 6
---

# Advanced menu

Advanced menu is used for advanced operations with ILM Appliance. You can access it from [**Main menu**](./main-menu.md) by selecting **Advanced options**.

| Short&nbsp;name | Advanced&nbsp;menu&nbsp;item                         | Description                                                                                  |
|-----------------|------------------------------------------------------|----------------------------------------------------------------------------------------------|
| **u**pdate      | Update Operating System                              | This option updates ILM Appliance by `apt update && apt upgrade` command.             |
| **r**emoveC     | [Remove ILM](#remove-ilm)              | This option removes ILM Appliance by deleting namespace `ilm` from Kubernetes. |
| **i**nstallC    | [Install only ILM](#install-only-ilm)  | This option (re)install only ILM, this can quite speedup proces of reinstalation.     |
| **r**emove      | [Remove RKE2 & ILM](#remove-rke2--ilm) | This option removes RKE2 (Kubernetes) and ILM Appliance.                              |
| **s**hell       | [Enter system shell](#enter-system-shell)            | You can enter system shell as `ilm` user.                                             |
| **r**eboot      | Reboot system                                        | This option reboots ILM Appliance by `shutdown -r now` command.                       |
| **s**hutdown    | Shutdown system                                      | This option shutdown ILM Appliance by `shutdown -h now` command.                      |
| **e**xit        | [Exit advanced menu](./main-menu.md)                 | By selecting this option you can return to Main menu.                                        |

## Remove ILM

Removing ILM from appliance mainly means deleting `ilm` namespace from Kubernetes. Purpose of this tasks is preparation step for ILM re-installation.

This task preserves anything that was configured, including ILM data which is stored in Postgres database.

## Install only ILM

This tasks only re/install ILM software. It is complementary to previous task and reduce reinstallation time comparing to full installation when status of RKE2 is verified. But you have to have operational RKE2 to sucesffuly finish this task.

## Remove RKE2 & ILM

Removing RKE2 (Kubernetes) and ILM might be useful when you change hostname or IP address of virtual appliance. This is preparation step for even deeper ILM re-installation.

This task preserves anything that was configured, including ILM data which is stored in Postgres database.

## Enter system shell

You can enter system shell as `ilm` user. The user is in `sudo` group. You can do any administrative task you wish. Please be very careful.

:::warning[System shell access]
If you are not sure about the result of your operations on the system shell, consult it with the ILM support team. It may happen that you will break the system and you will not be able to access it anymore.
:::
