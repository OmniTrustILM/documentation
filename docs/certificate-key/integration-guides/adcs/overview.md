---
sidebar_position: 1
---

# Overview

This document outlines the steps necessary to be taken on the Windows Server before the integration with ADCS can be configured.

This integration guide was tested on:
- Windows Server 2012 R2
- Windows Server 2016
- Windows Server 2019

## Active Directory presence

Depending on your environment, install the Active Directory Server Role according to the instructions from Microsoft and promote the Domain. Omit the step if you already have an onsite Active Directory structure. Make sure, the machine you are connecting is a member of the AD Domain.

:::info[How to install AD]
You can use as example the following guide:
[Install a New Windows Server 2012 Active Directory Forest (Level 200) | Microsoft Docs](https://docs.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/install-a-new-windows-server-2012-active-directory-forest--level-200-)
:::

## Active Directory Certificate Services presence

Depending on your environment, install the Active Directory Certificate Services Server Role according to the instructions from Microsoft. Omit the step if you already have Microsoft Certification Authority Running.

:::info[How to install ADCS]
You can use as example the following guide:
[Install Active Directory Certificate Services | Microsoft Docs](https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/jj717285(v=ws.11))
:::

## PowerShell remoting

PowerShell remoting is used to facilitate client-less integration with ADCS. PowerShell remoting is enabled by default on Windows Server platforms. You can use [`Enable-PSRemoting`](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/enable-psremoting?view=powershell-7.4) to enable PowerShell remoting on other supported versions of Windows and to re-enable remoting if it becomes disabled.

You have to run this command only one time on each computer that will receive commands.

PowerShell remoting can be facilitated using the following protocols:

| Protocol                                                                                                                    | Description                                                                                                                                                                                                                                                                                                 |
|-----------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [WinRM](https://learn.microsoft.com/en-us/windows/win32/winrm/portal)                                                       | Windows Remote Management (WinRM) is the Microsoft implementation of the WS-Management protocol, which is a standard Simple Object Access Protocol (SOAP)-based, firewall-friendly protocol that allows interoperation between hardware and operating systems from different vendors.                       |
| [SSH](https://learn.microsoft.com/en-us/powershell/scripting/learn/remoting/ssh-remoting-in-powershell?view=powershell-7.4) | SSH remoting lets you do basic PowerShell session remoting between Windows and Linux computers. SSH remoting creates a PowerShell host process on the target computer as an SSH subsystem. SSH-based remoting doesn't currently support remote endpoint configuration and Just Enough Administration (JEA). |

## Integration

The following steps should be done to successfully integrate ADCS with CZERTAINLY:

| #     | Reference                                             | Short description                            |
|-------|-------------------------------------------------------|----------------------------------------------|
| **1** | [Install PSPKI Module](./install-pspki.md)            | Prepare PowerShell PKI Module                |
| **2** | [WinRM Configuration](./winrm-configuration.md)       | Configure Windows Remote Management protocol |
| **3** | [SSH Configuration](./ssh-configuration.md)           | Configure Secure Shell protocol              |
| **4** | [Firewall Configuration](./firewall-configuration.md) | Configure inbound connections and delegation |
| **5** | [Create User](./create-user.md)                       | Create user to access ADCS                   |
| **6** | [Testing Integraton](./test-integration.md)           | Test integration and access to ADCS          |

## Troubleshooting

For common issues and troubleshooting, refer to [Troubleshooting](./troubleshooting.md).
