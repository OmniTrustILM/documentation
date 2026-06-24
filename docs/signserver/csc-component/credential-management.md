---
sidebar_position: 20
---

# Credential Management

Credential management is a non-CSC API that allows you to manage the long-lived user credentials used by the CSC component. The credentials are used to authorize the signature.

The API is exposed on the `/management/v1/credentials` endpoint and supports the following operations:

| Operation                                 | Description                                                                  |
|-------------------------------------------|------------------------------------------------------------------------------|
| `POST /management/v1/credentials/create`  | Create a new credential.                                                     |
| `POST /management/v1/credentials/rekey`   | Update (rekey) existing credential with new private key and certificate.     |
| `POST /management/v1/credentials/remove`  | Remove existing credential.                                                  |
| `POST /management/v1/credentials/disable` | Disable existing credential. Disabled credential cannot be used for signing. |
| `POST /management/v1/credentials/enable`  | Enable existing credential.                                                  |

For more information about the API, see the [Credential Management API](/api/csc-component#tag/Credentials-Management).
