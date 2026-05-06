---
sidebar_position: 1
---

# Overview

The platform implements the ACME (Automatic Certificate Management Environment) protocol to automate the process of certificate management. It offers simple integration with ACME server with the help of ACME objects that are easy to configure and to manage.

Implementation of ACME provides a flexibility for the clients and administrators to choose between running ACME endpoint that are bound to [RA Profile](../../concept-design/core-components/ra-profile.md).

:::info
ACME implementation follows [RFC 8555 - Automatic Certificate Management Environment (ACME)](https://datatracker.ietf.org/doc/html/rfc8555).
See [ACME protocol API](/api/protocol-acme/) for more information about implemented end points.
:::

## Platform ACME management

In order to start with the ACME protocol, the platform must be configured and act as the ACME server.
For this purpose we define the following management objects:

| ACME management object            | Description                                               |
|-----------------------------------|-----------------------------------------------------------|
| [`ACME Profile`](acme-profile.md) | Contains configuration of the ACME server                 |
| [`ACME Account`](acme-account.md) | Registered ACME account that consumes the ACME operations |

You can manage `ACME Profiles` and `ACME Accounts` through the web interface or through the [`Core ACME API`](/api/core-acme/).

## ACME Profile vs RA Profile ACME API

You can configure `ACME Profile` with or without `RA Profile`. And you can enable ACME API for any particular `RA Profile` only.
There are 2 ACME APIs that are implemented in the platform:

| ACME API                                                                              | Description                                                                                                                                                                             |
|---------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `ACME Profile`<br/>`https://<hostname>:<port>/acme/{acmeProfileName}/directory`       | To use `ACME Profile` directly from the client. In this case, the `ACME Profile` must have configure default `RA Profile`, otherwise the API won't be working                           |
| `RA Profile`<br/>`https://<hostname>:<port>/acme/raProfile/{raProfileName}/directory` | Any `RA Profile` can have enabled specific `ACME Profile`. The ACME API is in this case managed by the `RA Profile` and you do not have to configure it as a default for `ACME Profile` |

**When to use `ACME Profile` and when `RA Profile` ACME API?**

Depends on what you would like to achieve:
- if you would like to allow ACME clients to work only with one specific `RA Profile` then use `RA Profile` ACME API
- if you would like to have the flexibility in changing the `RA Profile` which is used by the ACME client, then use `ACME Profile` ACME API

:::info
`ACME Profile` can be used with multiple `RA Profiles`.
:::

:::warning
The platform performs various validations on the end point including the following:
- Availability of the `ACME Profile` or `RA Profile`
- Status of the `ACME Profile` or `RA Profile`
- If both `ACME Profile` and `RA Profile` are available and enabled
:::

The `ACME Profile` that has no configuration of default `RA Profile` is usually bound to one or multiple `RA Profiles`. In this case the `ACME Profile` configuration consist of consistent attributes that are used by ACME clients. 

## Supported operations

Supported operations are listed below:

| Operation                | Description                                                                                                                                                                   | End Points                                                                                                                     | RFC Reference                                                                          |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| **Directory**            | Get the directory object containing the URL for operations and other details including Terms of Service                                                                       | `/acme/{acmeProfileName}/directory` <br/> (or) <br/> `/acme/raProfile/{raProfileName}/directory`                               | [RFC 8555, section 7.1.1](https://datatracker.ietf.org/doc/html/rfc8555#section-7.1.1) |
| **New Nonce**            | Create a new Anti-Replay Nonce that should be used in the following requests in the header field by the client                                                                | `/acme/{acmeProfileName}/new-nonce` <br/> (or) <br/> `/acme/raProfile/{raProfileName}/new-nonce`                               | [RFC 8555, section 7.2](https://datatracker.ietf.org/doc/html/rfc8555#section-7.2)     |
| **New Account**          | Create a new account using the key pair generated by the client, get the existing account using the public key                                                                | `/acme/{acmeProfileName}/new-account` <br/> (or) <br/> `/acme/raProfile/{raProfileName}/new-account`                           | [RFC 8555, section 7.3](https://datatracker.ietf.org/doc/html/rfc8555#section-7.3)     |
| **Update Account**       | Update the account including the Terms of Service and External account binding                                                                                                | `/acme/{acmeProfileName}/acct/{accountId}` <br/> (or) <br/> `/acme/raProfile/{raProfileName}/acct/{accountId}`                 | [RFC 8555, section 7.3.2](https://datatracker.ietf.org/doc/html/rfc8555#section-7.3.2) |
| **New Order**            | Place a new order for a certificate. The order will contain the identifiers to which the certificate is being issued. New Order marks the first step in issuing a certificate | `/acme/{acmeProfileName}/new-order` <br/> (or) <br/> `/acme/raProfile/{raProfileName}/new-order`                               | [RFC 8555, section 7.4](https://datatracker.ietf.org/doc/html/rfc8555#section-7.4)     |
| **Challenge**            | Initiate the challenge validation from the server side once the client has satisfied the challenges                                                                           | `/acme/{acmeProfileName}/chall/{challengeId}` <br/> (or) <br/> `/acme/raProfile/{raProfileName}/chall/{challengeId}`           | [RFC 8555, section 7.5](https://datatracker.ietf.org/doc/html/rfc8555#section-7.5)     |
| **Finalize**             | Finalize the order for new certificate by providing the CSR                                                                                                                   | `/acme/{acmeProfileName}/order/{orderId}/finalize` <br/> (or) <br/> `/acme/raProfile/{raProfileName}/order/{orderId}/finalize` | [RFC 8555, section 7.4.2](https://datatracker.ietf.org/doc/html/rfc8555#section-7.4.2) |
| **Download Certificate** | Download the certificate once the certificate issuance is completed                                                                                                           | `/acme/{acmeProfileName}/cert/{certificateId}` <br/> (or) <br/> `/acme/raProfile/{raProfileName}/cert/{certificateId}`         | [RFC 8555, section 7.3.2](https://datatracker.ietf.org/doc/html/rfc8555#section-7.3.2) |
| **Revoke Certificate**   | Revoke a certificate if it is no longer viable. Revocation operation uses the certificate content for the server to identify                                                  | `/acme/{acmeProfileName}/revoke-cert` <br/> (or) <br/> `/acme/raProfile/{raProfileName}/order/revoke-cert`                     | [RFC 8555, section 7.6](https://datatracker.ietf.org/doc/html/rfc8555#section-7.6)     |
