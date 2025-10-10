---
sidebar_position: 10
---

# Secret

`Secret` holds sensitive information, such as passwords or PINs, that are used to access cryptographic tokens or other secure resources.
`Secret` is not designed to store the sensitive data, but rather to manage secret lifecycle and control access to it.

## Supported secret types

The following secret types are supported:
| Secret Type | Description                                 |
|-------------|---------------------------------------------|
| `Basic`     | A username and password combination         |
| `ApiKey`   | An API key used for authentication          |
| `SoftKeyStore` | A secret type used to store cryptographic keys |
| `Generic`   | A generic secret type that can be used for any purpose |
