---
sidebar_position: 14
---

# Secret Management

Platform offers secret management operations across various vault technologies.

:::info
All the secret management operations in the platform are achieved through the `Vault Profile`. To perform any action on a `Secret`, the `Secret` must be bound to a `Vault Profile`. See [`Vault Profile`](../core-components/vault-profile.md) for more information.
:::

Operations on `Secret` include:

- **Create** - Create a new secret in the vault through a `Vault Profile`
- **Update** - Update the content of an existing secret
- **Delete** - Delete a secret from all associated vaults
- **Get content** - Retrieve the secret content from the source vault

## Secret types

Secrets can be of different types depending on the kind of data they store. The following secret types are supported:

| Secret type              | Description                                                                    |
|--------------------------|--------------------------------------------------------------------------------|
| `Basic Authentication`   | Stores credentials used for basic authentication (username and password)       |
| `API Key`                | Stores a single API key used for authentication or authorization               |
| `JWT Token`              | Stores a JSON Web Token used for access to services or APIs                    |
| `Private Key`            | Stores a private cryptographic key                                             |
| `Secret Key`             | Stores a symmetric secret key used for cryptographic operations                |
| `Key Store`              | Stores a keystore containing keys and certificates                             |
| `Key-Value`              | Stores secret data as key-value pairs                                          |
| `Generic`                | Stores arbitrary secret content that does not fit a more specific secret type  |

## Secret versioning

Each time a secret content changes, a new `Secret Version` is created. The version tracks the history of the secret including:

- Version number
- Fingerprint of the content (calculated based on the secret content and type)
- Vault that managed the secret at the time
- Timestamp of creation

## Secret synchronization

When a `Secret` is associated with multiple `Vault Profiles`, the platform can synchronize the secret content from the source `Vault Profile` to all sync `Vault Profiles`. This ensures that the secret is consistent across all vaults.

When a `Secret` is updated or deleted, the operation is performed on the source `Vault Profile` and then propagated to all associated sync `Vault Profiles`.

## Approval support

Secret operations can be subject to approval workflows. When an `Approval Profile` is configured on the `Vault Profile`, the following operations require approval before execution:

- Create secret
- Update secret
- Delete secret
- Change source `Vault Profile`

While waiting for approval, the secret is in the `Pending Approval` state. If the approval is rejected, the secret moves to the `Rejected` state.

## Compliance

Secrets can be evaluated against compliance rules. When a `Compliance Profile` is assigned to a `Vault Profile`, the platform evaluates compliance rules against the secrets managed by that profile.
