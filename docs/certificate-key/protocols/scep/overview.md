---
sidebar_position: 1
---

# Overview

One of the most common use cases for SCEP is to manage certificates for devices that do not have a user interface. For example, a device that is not a computer, such as a router or a printer, or a computer that is not running any user interface. SCEP is also used to manage certificates for mobile devices that are not connected to the network all the time.

The platform implements SCEP (Simple Certificate Enrolment Protocol) protocol for certificate management and certificate and CRL queries. It supports various SCEP clients and are easy to configure and to manage.

Implementation of SCEP server provides a flexibility for the clients and administrators to choose between running SCEP endpoint that are bound to any [RA Profile](../../concept-design/core-components/ra-profile.md).

:::info
SCEP implementation follows [RFC 8894 - Simple Certificate Enrolment Protocol](https://datatracker.ietf.org/doc/html/rfc8894) with backward compatibility with [draft-nourse-scep-23](https://datatracker.ietf.org/doc/html/draft-nourse-scep-23).
[//]: # (TODO)
See [SCEP protocol API](#) for more information about implemented SCEP services.
:::

## Supported capabilities

The SCEP server implementation supports the following capabilities according to the [RFC 8894, section 3.5.2](https://datatracker.ietf.org/doc/html/rfc8894#name-ca-capabilities-response-fo):

| Capability       | Description                                                                                                                                                                                                                                                                |
|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| AES              | CA supports the AES128-CBC encryption algorithm.                                                                                                                                                                                                                           |
| DES3             | CA supports the triple DES-CBC encryption algorithm.                                                                                                                                                                                                                       |
| POSTPKIOperation | CA supports PKIOperation messages sent via HTTP POST.                                                                                                                                                                                                                      |
| Renewal          | CA supports the Renewal CA operation.                                                                                                                                                                                                                                      |
| SHA-1            | CA supports the SHA-1 hashing algorithm.                                                                                                                                                                                                                                   |
| SHA-256          | CA supports the SHA-256 hashing algorithm.                                                                                                                                                                                                                                 |
| SHA-512          | CA supports the SHA-512 hashing algorithm.                                                                                                                                                                                                                                 |
| SCEPStandard     | CA supports all mandatory-to-implement sections of the SCEP standard. This keyword implies "AES", "POSTPKIOperation", and "SHA-256", as well as the provisions of [RFC 8894, section 2.9](https://datatracker.ietf.org/doc/html/rfc8894#name-mandatory-to-implement-func). |

## Supported operations

The following operations are supported by the SCEP implementation:

| Operation    | Description                                                                                                                                                                                                                                                                             |
|--------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| GetCACaps    | Get the list of capabilities according to the [RFC 8894, section 3.5.1](https://datatracker.ietf.org/doc/html/rfc8894#name-messagetype)                                                                                                                                                 |
| GetCACert    | Get the CA certificate(s) according to the [RFC 8894, section 4.2](https://datatracker.ietf.org/doc/html/rfc8894#GetCACert)                                                                                                                                                             |
| PKIOperation | Perform a certificate enrolment, renewal, or polling client certificate according to the [RFC 8894, section 4.3](https://datatracker.ietf.org/doc/html/rfc8894#section-4.3) and [RFC 8894, section 4.3](https://datatracker.ietf.org/doc/html/rfc8894#name-poll-for-client-initial-cer) |

## Supported PKI messages types

The following PKI messages are supported by the SCEP implementation according to the [RFC 8894, section 3.2.1.2](https://datatracker.ietf.org/doc/html/rfc8894#name-messagetype):

| Message type | Description                                                             |
|--------------|-------------------------------------------------------------------------|
| CertRep      | Response to certificate or CRL request.                                 |
| PKCSReq      | PKCS#10 certificate request authenticated with a shared secret.         |
| RenewalReq   | PKCS#10 certificate request authenticated with an existing certificate. |
| CertPoll     | Certificate polling in manual enrolment.                                |

## Encryption of the message

Encryption of the message data, according to the [RFC 8894, section 3.1](https://datatracker.ietf.org/doc/html/rfc8894#name-scep-message-object-process) is supported using:
- the recipient's public key with the CMS KeyTransRecipientInfo mechanism (key is encryption capable)
- the challengePassword with the CMS PasswordRecipientInfo mechanism (key is not encryption capable)

## Microsoft Intune support

The SCEP protocol implementation supports the Microsoft Intune request validation. For more information, see [Intune Integration Guide](../../integration-guides/intune/overview.md).

### Certificate revocation

The certificates that are published by Intune to be revoked are checked on each Intune enabled `SCEP Profile` every hour.
Revocation request is submitted to associated `RA Profile` to revoke certificate and result is published back to Intune.

## Platform SCEP server management

In order to start with the SCEP protocol, the platform must be configured and act as the SCEP server.

For this purpose we define the [`SCEP Profile`](./scep-profile.md) that contains configuration of the SCEP server.

You can manage `SCEP Profile` through the web interface or through the [`Core SCEP API`](/api/core-scep).

## SCEP Profile vs RA Profile SCEP API

The `SCEP Profile` can be configured with or without default `RA Profile`. On the other hand, you can enable SCEP protocol (with the reference to already configured `SCEP Profile`) for any particular `RA Profile`.

There are the following options for SCEP service available:

| SCEP service using                                                                                         | Description                                                                                                                                                                                                                                                                                                                               |
|------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `SCEP Profile`<br/>`https://<hostname>:<port>/api/v1/protocols/scep/{scepProfileName}/pkiclient.exe`       | To use `SCEP Profile` directly from the client. In this case, the `SCEP Profile` must have configured a default `RA Profile`, otherwise the SCEP service won't be working. This option provides flexibility to change the underlying `RA Profile` without changing the configuration of SCEP client                                       |
| `RA Profile`<br/>`https://<hostname>:<port>/api/v1/protocols/scep/raProfile/{raProfileName}/pkiclient.exe` | `RA Profile` can enable SCEP protocol by using specific and already configured `SCEP Profile`. The SCEP service is in this case managed by the `RA Profile` and you do not have to configure it as a default for `SCEP Profile`. This option provides a way, how to assign multiple `RA Profiles` with general SCEP service configuration |

**When to use `SCEP Profile` and when `RA Profile` SCEP service?**

Depends on what you would like to achieve:
- if you would like to allow SCEP clients to work only with one specific `RA Profile` then enable SCEP protocol for the `RA Profile` using pre-configured `SCEP Profile`
- if you would like to have the flexibility in changing the `RA Profile` which is used by the SCEP client, then use `SCEP Profile` service and configure the default `RA Profile` for it (that can be changed when needed)

:::tip
`SCEP Profile` can be used with multiple `RA Profiles`.
:::

:::warning
The platform performs various validations on the backend including the following:
- Availability of the `SCEP Profile` or `RA Profile`
- Status of the `SCEP Profile` or `RA Profile`
- If both `SCEP Profile` and `RA Profile` are available and enabled
- If the `SCEP Profile` has configured default `RA Profile`
:::
