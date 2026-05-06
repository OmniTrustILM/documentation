---
sidebar_position: 5
---

# Configure Intune SCEP Profile

To integrate CZERTAINLY with registered application in [Authorize CZERTAINLY](./authorize-czertainly.md), we need to create `SCEP Profile` that will be used to validate and process Intune requests.

Please refer to [`SCEP Profile`](../../protocols/scep/scep-profile.md) documentation for more information and [Configuration of `SCEP Profile`](../../protocols/scep/enable-scep-ra-profile.md#configuration-of-scep-profile).

To enable Intune supprt in `SCEP Profile`, you need to set following values:
- **Enable Intune** -> `true`
- **Intune Tenant** -> Directory (tenant) ID of application
- **Intune Application ID** -> Application (client) ID
- **Intune Application Key** -> Application client secret value

## `SCEP Profile` certificate

Certificate to be used as SCEP CA certificate (for decryption and signing) must comply with the following requirements:
- key algorithm needs to be **RSA**
- **issued from the same CA which will be used to issue the device certificate**
- having either EKU **Server Authentication** or **Certificate Request Agent** (1.3.6.1.4.1.311.20.2.1)
- KU set to **Digital Signature** and **Key Encipherment**

:::warning[Improper configuration]
Improper configuration of the SCEP CA certificate may result in the failure of the Intune SCEP request.
:::
