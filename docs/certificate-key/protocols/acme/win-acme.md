---
sidebar_position: 14
---

# IIS win-acme

ACME protocol can be used for Windows web servers and other services as well. Since `certbot` supports binding only to `Apache` and `Ngnix` servers, we will use another available tool `win-acme` - Windows ACMEv2 client, which enables to manage the certificates on `IIS` Windows web servers, Exchange servers or enables the use of custom scripts to automate certificate issuance and renewal in Windows server environments. 

For more information about `win-acme`, refer to the [win-acme documentation](https://www.win-acme.com/manual/getting-started).

:::info
`certbot` can be used to manually manage certificates for Windows server. You need to create your own automation scripts in order to achieve automated binding with the `IIS`.
:::

## Prerequisites

Before configuring `win-acme` with CZERTAINLY, you need to have the following:
- `win-acme` installed in the host server. You can download the installation file from [win-acme installation](https://www.win-acme.com) download section
- Configured at least one `RA Profile`
- Properly configured DNS records for the hostname you are trying to obtain the certificate for (for HTTP validation, the machine that `win-acme` is running on must have the correct common name configured in DNS)
- If you intend to use automated detection of certificate common name, the IIS server needs to have at least configured hostname for one binding (port 80 for instance)
- Access to HTTP or DNS resources on your `IIS` Web server, that will be used to validate ACME challenges
- ACME protocol enabled according to the [Enable ACME](enable-acme.md)

For this guide, we will use `http-01` challenge validation, but the `dns-01` can be also configured and the process is similar.

## Configuration of `win-acme`

`win-acme` client is designed to be primary used as ACMEv2 client for Let's Encrypt Certification Authority and other ACME compliant servers. Before the first use we need to configure `win-amce` client to connect to CZERTAINLY platform instead of Let's Encrypt CA that is the default server. To achieve this, we need to set up correct endpoints in `win-acme` configuration file *`settings.json`*. Edit the *`settings.json`* file located in the root of `win-acme` directory with your preferred text editor and change the following lines:

| Line                     | Value                                                                          |
|--------------------------|--------------------------------------------------------------------------------|
| **DefaultBaseUri**       | `https://[domain]:[port]/api/v1/protocols/acme/raProfile/czertainly/directory` |
| **DefaultBaseUriTest**   | `https://[domain]:[port]/api/v1/protocols/acme/raProfile/czertainly/directory` |
| **DefaultBaseUriImport** | `https://[domain]:[port]/api/v1/protocols/acme/raProfile/czertainly/directory` |

With these parameters, we are directly connecting to the already configured `RA Profile` with name `czertainly` that has ACME enabled. 
For more information follow [win-acme settings](https://www.win-acme.com/reference/settings#acme).

:::note[`win-acme` Plugin support]
`win-acme` supports various sources plugins for binding (`IIS`, `Exchange` etc.) and validation plugins to prove the identity (HTTP, WebDAV, DNS etc.). For details how to use them, please visit: [win-acme source plugins](https://www.win-acme.com/reference/plugins/source/) and [win-acme validation plugins](https://www.win-acme.com/reference/plugins/validation/).
:::

## Using `win-acme` with `IIS` and self-hosted HTTP challenge

Once each pre-requisite and configuration are set up, you can run `win-acme` executable file *`wascs.exe`* with administrator privileges (to enable automatic detection of `IIS` services) and follow these steps:

### Interactive mode

- Please choose from the menu: **`N`** (*Create certificate, default settings*)
- Depending on your setup, we can either input the hostname of the certificate manually or detect it from the `IIS` configuration
- If `IIS` bindings are configured correctly, you will be asked to point `win-acme` to the site you want to issue certificate for
- In case your `IIS` bindings are not configured you will have to follow up with Full Options from the menu: **`M`**
- When finalizing the selection of the certificate name `win-acme` will automatically use `http-01` challenge. In this step `win-acme` will try to bind port 80 of the server and publish the challenge received from the ACME server; this challenge will be posted on the port 80 of your server
- Upon successfully challenge validation, `win-acme` will create the HTTPS bindings in the `IIS` automatically

:::warning
Make sure that the web server is reachable on the specified port number with the domain name you selected for the certificate from CZERTAINLY platform to validate the challenge. If the server is not accessible for the CZERTAINLY, it will not be able to validate the challenge and the process will fail.
:::

### Unattended mode

The following represents a sample process of issuing certificate for self-hosted `IIS` with binding to the host `www.example.com`: 

```powershell
wacs.exe `
  --source iis `
  --host www.example.com `
  --webroot C:\sites\wwwroot
```

:::info
For all `win-acme` command line arguments, refer to [win-acme documentation](https://www.win-acme.com/reference/cli).
:::

## Automation of certificate renewal

`win-acme` can automatically renew any certificate that it obtained from ACME server using Windows Scheduler task. To configure automated renewal, follow these steps:

### Interactive mode

- Run `win-acme` executable file *`wascs.exe`* with administrator privileges
- Please choose from the menu: **`O`** (*More Options*)
- Please choose from the menu> **`T`** (*(Re)Create Scheduled Task*)
- Please specify the user you want the task to be run under (user with administrator privileges is recommended to allow automatic binding configuration on the `IIS` server)
- The scheduled task for automatic renewal of all certificates managed by `win-acme` is now created

### Unattended mode

```powershell
wacs.exe `
  --setuptaskscheduler
```

:::danger[Compatibility issues in older versions of Windows server]
`win-acme` might have issues running properly on older versions of Windows Server (2012 and older) due to compatibility with TLS 1.2 cipher suite. If you are struggling to establish the connection with the ACME server, try to consult your SSL and TLS settings with administrators of your system.
:::
