---
sidebar_position: 7
---

# Create Intune Profiles

For successful enrollment of certificate to device, it is necessary to configure Intune configuration profiles.

## Trusted certificate configuration profiles

Trusted certificate profile is used to deploy the trusted certificates to devices that will be enrolled with certificate through Intune. Trusted root certificates establish a trust from the device to your root or intermediate (issuing) CA from which the other certificates are issued.

Following [To create a trusted certificate profile](https://learn.microsoft.com/en-us/mem/intune/protect/certificates-trusted-root#to-create-a-trusted-certificate-profile), create trusted certificate profiles for root CA certificate and issuing (intermediate) CA certificates and select corresponding destination:
- Computer certificate store - root CA certificate
- Computer certificate store - issuing CA certificate
- User certificate store - issuing CA certificate

Based on the selected destination, the CA certificate will be deployed to the corresponding certificate store on the device.

Create as many trusted certificate profiles as you need to represent the chain of trust for both device certificates and `SCEP Profile` certificate.

:::warning[CA certificate]
Selected SCEP CA certificate in `SCEP profile` has to be issued by same CA as device certificates that will be enrolled through Intune, for more information, see [`SCEP Profile` certificate](./configure-scep-intune.md#scep-profile-certificate).
:::

## SCEP certificate configuration profile

For devices to use SCEP certificate profile, they must trust your Trusted Root Certification Authority (CA) by deploying a trusted certificate profile to the same group that receives the SCEP certificate profile.

Following [Create a SCEP certificate profile](https://learn.microsoft.com/en-us/mem/intune/protect/certificates-profile-scep#create-a-scep-certificate-profile), create SCEP certificate profile with the following configuration specific to CZERTAINLY SCEP service:
- **Root Certificate** - select trusted certificate profile representing issuing CA certificate
- **SCEP Server URLs** - specify URL found in detail page of `SCEP Profile` without `pkiclient.exe`

:::tip[SCEP Server URLs]
See [SCEP Profile vs RA Profile SCEP API](../../protocols/scep/overview.md#scep-profile-vs-ra-profile-scep-api) for more information on how to configure SCEP server URL. For example, it can be:
- `https://<hostname>:<port>/api/v1/protocols/scep/{scepProfileName}`
- `https://<hostname>:<port>/api/v1/protocols/scep/raProfile/{raProfileName}`
:::

After SCEP certificate profile is created, assign it to corresponding group.

:::info[Manage groups and users]
In case you need more information how to create group to manage your users, refer to [Step 3 - Create a group to manage users](https://learn.microsoft.com/en-us/mem/intune/fundamentals/quickstart-create-group) of the Microsoft Intune evaluation guide. 
:::
