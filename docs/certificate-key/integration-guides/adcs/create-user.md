---
sidebar_position: 11
---

# Create User

Create a user in Active Directory and assign the user with necessary permissions by adding the user to the respective groups as per your use case.

## Allow user to connect through WinRM

To enable the user to connect through WinRM, the user needs to be in Remote Management Users user group. This will enable the user to connect and by default to run PowerShell commands. In case you need to specify the permissions specifically, run the following script on the server and make sure that the user has at least `Read` and `Execute` permissions:

```powershell
# Specify the username you want to add to the group
$userToAdd = "YourUsername"

# Specify the session configuration name
$sessionConfigurationName = "Microsoft.PowerShell"

# Get the current security descriptor for the specified session configuration
$securityDescriptor = Get-PSSessionConfiguration -Name $sessionConfigurationName | Get-PSSessionConfiguration -ShowSecurityDescriptorUI

# Add the user to the "Remote Management Users" group with Read and Execute permissions
$remoteManagementUsersGroup = New-Object System.Security.Principal.NTAccount("Remote Management Users")
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule($userToAdd, "Read, Execute", "Allow")
$securityDescriptor.Access.Add($accessRule)

# Set the modified security descriptor back to the session configuration
Set-PSSessionConfiguration -Name $sessionConfigurationName -SecurityDescriptorSddl $securityDescriptor.Sddl
```

You can display the current security descriptor for the session configuration by running the following command:

```powershell
Set-PSSessionConfiguration -ShowSecurityDescriptorUI -Name Microsoft.PowerShell
```

## Active Directory permissions

The user needs `Read` permissions on the Active Directory objects in `CN=Certificate Templates, CN=Public Key Services, CN=Services` in `Configuration Naming` Context. These permissions should be present by default as Authenticated Users. It can be validated using the following command:
    
```powershell
Import-Module ActiveDirectory
Get-Acl -Path "AD:\CN=Certificate Templates,CN=Public Key Services,CN=Services,CN=Configuration,DC=YourDomain,DC=com" | Format-List

Path   : Microsoft.ActiveDirectory.Management\ActiveDirectory:://RootDSE/CN=Certificate Templates,CN=Public Key Services,CN=Services,CN=Configuration,DC=YourDomain,DC=com
Owner  : YourDomain\Enterprise Admins
Group  : YourDomain\Enterprise Admins
Access : NT AUTHORITY\Authenticated Users Allow
         NT AUTHORITY\SYSTEM Allow
         YourDomain\Enterprise Admins Allow
         YourDomain\Domain Admins Allow
Audit  :
Sddl   : ...
```

Make sure to replace `YourDomain` with the actual name of your domain. If the Active Directory module is not installed on your machine, you may need to install it or run the command on a machine where the module is available.

If you're running this on a domain controller, you may not need to import the module explicitly. However, on other machines, you might need to import it to access the Active Directory cmdlets.

## ADCS permissions

The created user needs to have permissions to `Request`, `Issue` and `Read` certificates on the certification authority.

To configure the proper permissions for a user you can use the `certutil` command-line utility through the PowerShell:

```powershell
# Specify the username you want to grant permissions
$userToAdd = "YourUsername"

# Specify the Certification Authority common name (CN)
$caCommonName = "YourCACommonName"

# Grant the user the necessary permissions using certutil
certutil -ca.cert "%computername%\$caCommonName" -repairstore -p "YourCAPassword" -users $userToAdd:RSWREAD+RSWENROLL
```

Make sure to replace the following placeholders with your actual information:

- `YourUsername`: Replace this with the username for which you want to grant permissions.
- `YourCACommonName`: Replace this with the common name of your Certification Authority.
- `YourCAPassword`: Replace this with the password for your CA.

This command uses `certutil` to configure permissions on the CA for the specified user. The permissions specified are `RSWREAD (Read)` and `RSWENROLL (Request, Issue)`. Note that you might need administrative privileges to run this command, and it's important to handle CA-related tasks with caution.

Additionally, you may need to run this command on the machine where the CA is installed or have appropriate permissions to manage the CA remotely.
