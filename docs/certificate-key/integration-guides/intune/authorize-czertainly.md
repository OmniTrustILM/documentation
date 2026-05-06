---
sidebar_position: 3
---

# Authorize CZERTAINLY

To allow a third-party SCEP server to run custom challenge validation with Intune, create an app in Azure AD. This app gives delegated rights to Intune to validate SCEP requests.

Follow Microsoft guide to [Authorize communication between CA and Intune](https://learn.microsoft.com/en-us/mem/intune/protect/certificate-authority-add-scep-overview#authorize-communication-between-ca-and-intune) and
1. Create an application in Azure Active Directory
2. Create an application client secret
3. Manage application API permissions

:::info[Credentials]
After this step, you should have new registered application with required permissions. Ensure that you have the following information recorded to [Configure Intune SCEP Profile](./configure-scep-intune.md):
- Application (client) ID
- Directory (tenant) ID
- Application client secret value
:::
