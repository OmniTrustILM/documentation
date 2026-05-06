---
sidebar_position: 9
---

# Firewall Configuration

The following firewall rules need to be configured on the machine for remoting to work properly:

| Protocol | Port   | Description      |
|----------|--------|------------------|
| TCP      | `5985` | WinRM            |
| TCP      | `5986` | WinRM with HTTPS |
| TCP      | `22`   | SSH              |

## Testing firewall configuration

### WinRM

To check the firewall configuration for WinRM, run the following command from an elevated PowerShell console:
```powershell
# Confirm the Firewall rule is configured. It should be created automatically by setup. Run the following to verify
# WinRM over HTTP
if (!(Get-NetFirewallRule -Name "Windows Remote Management (HTTP-In)" -ErrorAction SilentlyContinue | Select-Object Name, Enabled)) {
    Write-Output "Firewall Rule 'Windows Remote Management (HTTP-In)' does not exist, creating it..."
    New-NetFirewallRule -Name 'Windows Remote Management (HTTP-In)' -DisplayName 'Windows Remote Management (HTTP-In)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 5985
} else {
    Write-Output "Firewall rule 'Windows Remote Management (HTTP-In)' has been created and exists."
}

# Test that the port is open
Test-NetConnection -ComputerName "Machine IP or Name" -Port 5985

# WinRM over HTTPS
if (!(Get-NetFirewallRule -Name "Windows Remote Management (HTTPS-In)" -ErrorAction SilentlyContinue | Select-Object Name, Enabled)) {
    Write-Output "Firewall Rule 'Windows Remote Management (HTTPS-In)' does not exist, creating it..."
    New-NetFirewallRule -Name 'Windows Remote Management (HTTPS-In)' -DisplayName 'Windows Remote Management (HTTPS-In)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 5986
} else {
    Write-Output "Firewall rule 'Windows Remote Management (HTTPS-In)' has been created and exists."
}

# Test that the port is open
Test-NetConnection -ComputerName "Machine IP or Name" -Port 5986
```

### SSH

Check that the SSH port is open by running the following command from an elevated PowerShell console:
```powershell
# Confirm the Firewall rule is configured. It should be created automatically by setup. Run the following to verify
if (!(Get-NetFirewallRule -Name "OpenSSH-Server-In-TCP" -ErrorAction SilentlyContinue | Select-Object Name, Enabled)) {
    Write-Output "Firewall Rule 'OpenSSH-Server-In-TCP' does not exist, creating it..."
    New-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
} else {
    Write-Output "Firewall rule 'OpenSSH-Server-In-TCP' has been created and exists."
}

# Test that the port is open
Test-NetConnection -ComputerName "Machine IP or Name" -Port 22
```
