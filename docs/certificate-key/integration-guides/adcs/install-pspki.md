---
sidebar_position: 3
---

# Install PSPKI Module

The [**PSPKI module for PowerShell**](https://github.com/PKISolutions/PSPKI) is intended to simplify various PKI and Active Directory Certificate Services management tasks by using automation with Windows PowerShell. The module provides features and capabilities for managing and configuring Certification Authorities.

Although it is an optional component, the majority of providers and connectors are using it to provide better user experience and more features.

To install the PSPKI module, first make sure you are using the newest version of PowerShell from Microsoft. At least version 5 is required.

:::info[PSPKI module requirements]
The PSPKI module requires Windows PowerShell 3.0 or higher and .NET Framework 4.7.2 or higher. Check the [official project page](https://github.com/PKISolutions/PSPKI) for more information.
:::

## Installation steps

- Enable TLSv1.2 Protocol for PowerShell by running the following in an elevated PowerShell console on the server:
```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
```

- Register a PSRepository for installation of modules to PowerShell by running the following in an elevated PowerShell console on the server:
```powershell
Register-PSRepository -Default
```

- Finally, install the PSPKI module by running the following in an elevated PowerShell console on the server:
```powershell
Install-Module -Name PSPKI
```

## Test PSPKI module installation

To test the PSPKI module, run the following in PowerShell console on the server:
```powershell
Get-Command -Module PSPKI
```

The output should look similar to this:
```powershell

CommandType     Name                                               Version    Source
-----------     ----                                               -------    ------
Alias           Add-AIA                                            3.7.2      PSPKI
Alias           Add-CAAccessControlEntry                           3.7.2      PSPKI
Alias           Add-CAACL                                          3.7.2      PSPKI
Alias           Add-CDP                                            3.7.2      PSPKI
Alias           Add-OCSPACL                                        3.7.2      PSPKI
Alias           Connect-CA                                         3.7.2      PSPKI
Alias           Disable-CRLFlag                                    3.7.2      PSPKI
Alias           Disable-KRAFlag                                    3.7.2      PSPKI
Alias           Enable-CRLFlag                                     3.7.2      PSPKI
Alias           Enable-KRAFlag                                     3.7.2      PSPKI
Alias           Get-AIA                                            3.7.2      PSPKI
Alias           Get-CA                                             3.7.2      PSPKI
Alias           Get-CAACL                                          3.7.2      PSPKI
Alias           Get-CASecurityDescriptor                           3.7.2      PSPKI
Alias           Get-CDP                                            3.7.2      PSPKI
Alias           Get-CRL                                            3.7.2      PSPKI
Alias           Get-CRLFlag                                        3.7.2      PSPKI
Alias           Get-Csp                                            3.7.2      PSPKI
Alias           Get-CTL                                            3.7.2      PSPKI
...
```

:::tip[Using PSPKI module]
Using PSPKI module commands requires to import the module first. To import the module, run the following in PowerShell console on the server:
```powershell
Import-Module PSPKI
```
:::
