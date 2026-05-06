---
sidebar_position: 5
---

# WinRM Configuration

WinRM is a Microsoft implementation of the WS-Management Protocol, which is a standard Simple Object Access Protocol (SOAP)-based, firewall-friendly protocol that allows interoperation between hardware and operating systems from different vendors.

It is used to facilitate client-less integration with Microsoft ADCS.

## WinRM authentication

Windows Remote Management maintains security for communication between computers by supporting several standard methods of authentication and message encryption.

The following table lists the [authentication methods](https://learn.microsoft.com/en-gb/windows/win32/winrm/authentication-for-remote-connections) that are supported by WinRM:

| Authentication Method | Local Accounts                                | Active Directory Accounts                     | Credential Delegation                         | HTTP Encryption                               |
|-----------------------|-----------------------------------------------|-----------------------------------------------|-----------------------------------------------|-----------------------------------------------|
| Basic                 | <span class="badge badge--success">Yes</span> | <span class="badge badge--danger">No</span>   | <span class="badge badge--danger">No</span>   | <span class="badge badge--danger">No</span>   |
| NTLM                  | <span class="badge badge--success">Yes</span> | <span class="badge badge--success">Yes</span> | <span class="badge badge--danger">No</span>   | <span class="badge badge--danger">No</span>   |
| Kerberos              | <span class="badge badge--danger">No</span>   | <span class="badge badge--success">Yes</span> | <span class="badge badge--success">Yes</span> | <span class="badge badge--success">Yes</span> |
| CredSSP               | <span class="badge badge--success">Yes</span> | <span class="badge badge--success">Yes</span> | <span class="badge badge--success">Yes</span> | <span class="badge badge--success">Yes</span> |
| Certificate           | <span class="badge badge--success">Yes</span> | <span class="badge badge--danger">No</span>   | <span class="badge badge--danger">No</span>   | <span class="badge badge--danger">No</span>   |

:::warning[Access delegation]
Enterprise ADCS is using multiple stores for its configuration, therefore for successful integration it is usually needed to have access to the ADCS service and Active Directory containers on Domain Controllers that host for instance the AD Certificate Templates. For security reasons, Windows Remote Management allows access delegation only for Kerberos and CredSSP authentication mechanisms.
:::

## WinRM encryption

By default, WinRM will fail to work when running over an unencrypted channel. Using WinRM with TLS is the recommended option as it works with all authentication options, but requires a certificate to be created and used on the WinRM listener.

The certificate can be created using the `New-SelfSignedCertificate` cmdlet, or by using the `certreq` command to create a certificate request and then submitting it to a Certificate Authority (CA). If in a domain environment, ADCS can create a certificate for the host that is issued by the domain itself.

If using HTTPS is not an option, then WinRM can be used with encrypted payload when the authentication option is `NTLM`, `Kerberos` or `CredSSP`. The message-level encryption is not used when running over HTTPS because the encryption uses the more secure TLS protocol instead.

## WinRM configuration

To configure Windows Remote Management (WinRM), run the following command from an elevated PowerShell console:
```powershell
winrm quickconfig
```

Check that the WinRM Service is listening on port `5985` by running the following command from an elevated PowerShell console:
```powershell
winrm e winrm/config/listener

Listener
    Address = *
    Transport = HTTP
    Port = 5985
    Hostname
    Enabled = true
    URLPrefix = wsman
    CertificateThumbprint
    ListeningOn = ..., ::1

Listener
    Address = *
    Transport = HTTPS
    Port = 5986
    Hostname = test.example.com
    Enabled = true
    URLPrefix = wsman
    CertificateThumbprint = 4feb511be2cdb7ef1a58fdd4be0a56e2e17450a3
    ListeningOn = ..., ::1
```

Validate the default configuration of WinRM service by running the following command from the elevated PowerShell console:
```powershell
winrm get winrm/config

Config
    MaxEnvelopeSizekb = 500
    MaxTimeoutms = 60000
    MaxBatchItems = 32000
    MaxProviderRequests = 4294967295
    Client
        NetworkDelayms = 5000
        URLPrefix = wsman
        AllowUnencrypted = true
        Auth
            Basic = true
            Digest = true
            Kerberos = true
            Negotiate = true
            Certificate = true
            CredSSP = false
        DefaultPorts
            HTTP = 5985
            HTTPS = 5986
        TrustedHosts
    Service
        RootSDDL = O:NSG:BAD:P(A;;GXGR;;;S-1-5-21-3820024857-2695711099-450958038-1618)(A;;GA;;;DA)(A;;GA;;;BA)(A;;GAGR;;;RM)(A;;GR;;;IU)S:P(AU;FA;GA;;;WD)(AU;SA;GXGW;;;WD)
        MaxConcurrentOperations = 4294967295
        MaxConcurrentOperationsPerUser = 1500
        EnumerationTimeoutms = 240000
        MaxConnections = 300
        MaxPacketRetrievalTimeSeconds = 120
        AllowUnencrypted = true
        Auth
            Basic = true
            Kerberos = true
            Negotiate = true
            Certificate = false
            CredSSP = true
            CbtHardeningLevel = Relaxed
        DefaultPorts
            HTTP = 5985
            HTTPS = 5986
        IPv4Filter = *
        IPv6Filter = *
        EnableCompatibilityHttpListener = false
        EnableCompatibilityHttpsListener = false
        CertificateThumbprint = 4feb511be2cdb7ef1a58fdd4be0a56e2e17450a3
        AllowRemoteAccess = true
    Winrs
        AllowRemoteShellAccess = true
        IdleTimeout = 7200000
        MaxConcurrentUsers = 2147483647
        MaxShellRunTime = 2147483647
        MaxProcessesPerShell = 2147483647
        MaxMemoryPerShellMB = 2147483647
        MaxShellsPerUser = 2147483647
```

Under the service configuration, negotiation authentication needs to be enabled. Check the output of the previous command to verify that `Negotiate = true`.

## CredSSP configuration

Enable CredSSP authentication on the server (that CZERTAINLY is going to connect to) by running the following command:

```powershell
Enable-WSManCredSSP -Role Server
```

Validate the default configuration of WinRM service by running the following command from the elevated PowerShell console:

```powershell
winrm get winrm/config
```

Check the output of the previous command to verify that under WinRM service (not client) `CredSSP = true`.

By default, the WinRM service will create a self-signed certificate that is used for CredSSP security (message encryption and signing). **However, if Server Authentication certificate is present in Computer Certification store, it will try to use it instead.**

Check the certificate thumbprint by running the following command:

```powershell
winrm get winrm/config/service
```

In case a certificate was selected from the computer store you will see the Certificate Thumbprint in the WinRM service configuration `CertificateThumbprint`.

The account that is running Windows Remote Management service (Network Service by default) must have access to the private key of the certificate.
This is configured on the server. Locate the certificate with the thumbprint configured under `winrm service` (previous step), and configure account to have at least `Read` access for the private key. (select All Tasks and Manage Private Keys in the Manager).

### Delegate credentials

Enabling CredSSP account delegation on a Windows client involves configuring Group Policy or Registry Items settings.

Using Group Policy Editor, navigate to Computer Configuration, Administrative Templates, System and Credentials Delegation. Enable Allow delegating fresh credentials and allow delegating fresh credentials with NTLM-only server authentication. In the options add your servers to the list or use an asterisk (*) to allow for all connections.

You can use PowerShell to automate these changes:

```powershell
New-Item `
  -Path HKLM:\SOFTWARE\Policies\Microsoft\Windows\CredentialsDelegation `
  -Name AllowFreshCredentialsWhenNTLMOnly `
  -Force
 
New-ItemProperty `
  -Path HKLM:\SOFTWARE\Policies\Microsoft\Windows\CredentialsDelegation\AllowFreshCredentialsWhenNTLMOnly `
  -Name 1 `
  -Value * `
  -PropertyType String
 
New-Item `
  -Path HKLM:\SOFTWARE\Policies\Microsoft\Windows\CredentialsDelegation `
  -Name AllowFreshCredentials `
  -Force
 
New-ItemProperty `
  -Path HKLM:\SOFTWARE\Policies\Microsoft\Windows\CredentialsDelegation\AllowFreshCredentials `
  -Name 1 `
  -Value * `
  -PropertyType String

# Update Group Policy settings to apply changes
gpupdate /force
```

Make sure to replace "Server1", "Server2" with the actual names of your servers.

:::warning
Modifying the registry and Group Policy settings should be done with caution. Ensure that you have the necessary permissions to make these changes. Also, running these commands may require elevated privileges (Run PowerShell as Administrator). Additionally, changes to Group Policy may not take effect immediately, and you might need to log out or restart your computer for the settings to apply.
:::

## Limitations

There are some limitations to the WinRM integration to manage ADCS:

- Credentials are delegated for only `Kerberos` and `CredSSP` authentication method.
- Commands under WinRM are done under a non-interactive session, which can prevent certain commands or executables from running to manage ADCS.
