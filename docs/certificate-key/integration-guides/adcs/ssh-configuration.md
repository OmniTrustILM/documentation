---
sidebar_position: 7
---

# SSH Configuration

SSH is available for Linux and Windows platforms and allows PowerShell remoting.
SSH-based remoting doesn't support remote endpoint configuration and [Just Enough Administration (JEA)](https://learn.microsoft.com/en-us/powershell/scripting/learn/remoting/jea/overview).

SSH remoting creates a PowerShell host process on the target computer as an SSH subsystem. According to Microsoft, SSH will implement a general hosting model, similar to WinRM, to support endpoint configuration and JEA, however, it is not yet available and there is no ETA when it will be available.

## Prerequisites

There are couple of prerequisites that need to be met before the SSH remoting can be used:
- PowerShell 7 or higher must be installed on all computers
- Windows Server 2019 or Windows 10 1809 or higher is required
- You need local administrator rights on the computer you want to remote to

## Installation of the SSH service on Windows

Follow the [official documentation](https://docs.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse) to install the SSH service on Windows. For more information on the Powershell remoting over SSH, see the [official documentation](https://docs.microsoft.com/en-us/powershell/scripting/learn/remoting/ssh-remoting-in-powershell).

Install OpenSSH Server for Windows:
```powershell
Get-WindowsCapability -Online | ?{$_.Name -like "OpenSSH.Server*"} | Add-WindowsCapability -Online
```

Open elevated PowerShell console and start the SSH service:
```powershell
Start-Service sshd

# OPTIONAL but recommended:
Set-Service -Name sshd -StartupType 'Automatic'
```

Edit the `sshd_config` file located at `$env:ProgramData\ssh` and enable password and public key authentication:
```powershell
PasswordAuthentication yes
PubkeyAuthentication yes
```

Create the SSH subsystem that hosts a PowerShell process on the remote computer:
```powershell
Subsystem powershell c:/progra~1/powershell/7/pwsh.exe -sshs -nologo
```

Restart the SSH service:
```powershell
Restart-Service sshd
```

## Limitations

There are couple of limitations that need to be considered when using SSH remoting:

- The sudo command doesn't work in a remote session to a Linux computer.
- PowerShell remoting over SSH doesn't support Profiles and doesn't have access to `$PROFILE`. Once in a session, you can load a profile by dot sourcing the profile with the full filepath. This isn't related to SSH profiles. You can configure the SSH server to use PowerShell as the default shell and to load a profile through SSH.
- Prior to PowerShell 7.1, remoting over SSH didn't support second-hop remote sessions. This capability was limited to sessions using WinRM. PowerShell 7.1 allows Enter-PSSession and Enter-PSHostProcess to work from within any interactive remote session.
