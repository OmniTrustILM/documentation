---
sidebar_position: 21
---

# Secret

The entity `Secret` is a representation of a secret stored in a `Vault`. One `Secret` can be used by multiple `Vaults` and they can be managed using a source `Vault Profile`.

## Secret Content
The content of a `Secret` is stored in a `Vault` on provider side. 

`Secret Content` is dependent on the selected secret type. Each secret content object represents a specific kind of secret data.

| Secret content option  | Description                                                                    | Content                                                                      |
|------------------------|--------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| `Basic Authentication` | Stores credentials used for basic authentication.                              | Username and password.                                                       |
| `API Key`              | Stores a single API key used for authentication or authorization.              | API key value.                                                               |
| `JWT Token`            | Stores a JSON Web Token used for access to services or APIs.                   | JWT token value.                                                             |
| `Private Key`          | Stores a private cryptographic key.                                            | Private key material.                                                        |
| `Secret Key`           | Stores a symmetric secret key used for cryptographic operations.               | Secret key value.                                                            |
| `Key Store`            | Stores a keystore containing keys and certificates.                            | Keystore content and related access data such as password and keystore type. |
| `Key-Value`            | Stores secret data as a key-value pair.                                        | Map of key and its corresponding secret value.                               |
| `Generic`              | Stores arbitrary secret content that does not fit a more specific secret type. | Base64 encoded generic secret value or custom secret data structure.         |



## Source Vault Profile
The `Source Vault Profile` and its parent `Vault` are the primary sources for the `Secret`. When a `Secret` is created, it is the vault that creates the secret. 
`Secret Content` is always retrieved from the source `Vault Profile` and access to `Secret` is evaluated based on the source profile. When a `Source Vault Profile` is changed, the previous source profile is moved to `Sync Vault Profile`.

## Sync Vault Profiles
`Sync Vault Profile` is a profile also associated with `Secret`. When `Secret` is updated or deleted, besides being also updated in the source `Vault Profile`, it is also updated in the `Sync Vault Profile`.

## Secret Version
`Secret Version` is used to track the history of a `Secret`. It contains information about `Vault` that managed the `Secret`, version of the `Secret` in that vault, and fingerprint of its content. Secret fingerprint is calculated based on the secret content and content type.
The `Secret Version` is updated when a change in content is detected or when a source vault of `Secret` is updated.

## Secret Management

Secrets are managed with [Secret API](/api/core-secret/).
