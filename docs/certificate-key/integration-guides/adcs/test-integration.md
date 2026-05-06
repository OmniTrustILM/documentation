---
sidebar_position: 13
---

# Testing Integration

## Testing WinRM connection

To test the correct setup of WinRM, the server can be accessed over WinRM from any Windows Machine with PowerShell using the following command:

```powershell
Enter-PSSession `
  -ComputerName “Machine IP or Name” `
  -Credential “Domain\User Name” `
  -Authentication CredSSP
```

For more information on the `Enter-PSSession` command, see the [official documentation](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/enter-pssession).

:::info[Linux client]
The PowerShell remoting is also supported on Linux. You can install PowerShell on Linux by following the [official documentation](https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell-on-linux?view=powershell-7.4).
Configuration of the PowerShell remoting on Linux might differ based on the distribution. The CredSSP authentication is not supported on Linux PowerShell.
:::

On Linux, you can use the `pywinrm` Python module to test the connection:

```python
import winrm
p = winrm.Protocol(
    endpoint='Machine IP or Name',
    transport='credssp',
    username='username',
    password='password')
```

For more information on the `pywinrm` module, see the [official documentation](https://github.com/diyan/pywinrm/).

:::tip[Trusted hosts on Windows]
Be aware, that by default WinRM client configuration only allows Kerberos authentication to not known hosts (not in domain). To add your server to the trusted hosts on the client Windows machine run the following command:
```powershell
Set-Item WSMan:localhost\client\trustedhosts -value “Machine IP or Name”
```
:::

## Testing remoting over SSH

To test the correct setup of remoting over SSH, the server can be accessed over SSH from any Linux machine with PowerShell using the following command:

```powershell
Enter-PSSession `
  -HostName “Machine IP or Name” `
  -UserName “Domain\User Name” `
  -KeyFilePath “Path to private key” `
```

You can also use any SSH client to test the connection using standard commands like `ssh` or `putty`, for example:
```bash
ssh -i "Path to private key" "Domain\User Name@Machine IP or Name"
```
