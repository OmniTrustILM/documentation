---
sidebar_position: 2
---

# Create Role and Permissions

In OTPKI, permissions are granted to roles, and roles are held by users. The OTPKI Connector acts as an OTPKI user, so it needs a role that allows exactly the operations it performs.

Create the role first. The next step, [Create OAuth Client](./create-oauth-client.md), puts the name of this role into the access token so that OTPKI assigns it to the connector.

## Create the role

Create a role for the connector, for example `ilm-connector`. Note the exact name, it has to be reproduced in the access token.

For more information, refer to [Roles](https://docs.otpki.com/docs/operations/administration/identity/roles/).

## Grant the permissions

Grant the role the following permissions. Every listed action must resolve to **Allow**.

| Resource              | Actions                          | Required for                                                                    |
|-----------------------|----------------------------------|-----------------------------------------------------------------------------------|
| Certificate Authority | Read                             | Connection check, listing certification authorities, downloading CA certificates |
| Certificate Profile   | Read                             | Listing the certificate profiles available for an `RA Profile`                   |
| End Entity Profile    | Read                             | Listing the end entity profiles available for an `RA Profile`                    |
| End Entity            | Create, Read, Update, Revoke     | Creating the end entity for a certificate, enrolling it, and revoking it         |
| Issuance Request      | Create, Read                     | The issuance that an enrollment creates, and reading its result                  |
| Certificate           | Issue, Read, Revoke              | Issuing certificates, matching them by serial number, and revoking them          |

:::info[Least privilege]
The connector never deletes objects in OTPKI, and never manages users, roles, or permissions. Do not grant it **Delete** or any administration permissions. CRL retrieval is not implemented by the connector, so no permission relates to it.
:::

Instead of setting the individual cells, you can start from an OTPKI permission template and remove what is not needed. Templates replace the whole permission set of a role, so apply one before making manual changes rather than after.

For more information on how the permission matrix resolves, refer to [Permissions](https://docs.otpki.com/docs/operations/administration/permissions/).
