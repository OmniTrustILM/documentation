---
sidebar_position: 6
---

# CERTIFICATE_MISMATCH

| Property    | Value |
|-------------|-------|
| HTTP status | `422 Unprocessable Entity` |
| Retryable   | No |
| Error code  | `CERTIFICATE_MISMATCH` |

## Summary

The certificate that the request names belongs to a different certification authority than the one the request addresses.

## When it occurs

- An [Authority Provider v3](/docs/certificate-key/connectors/provider-interfaces/authority-provider-v3#errors) connector answers it to a request that names an existing certificate, such as a revocation or an identification, when the addressed authority did not issue that certificate.

## What the platform does

The operation fails.

## How to fix

- Handle the certificate through an RA profile of the certification authority that issued it, then repeat the operation.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/connector/authority/CERTIFICATE_MISMATCH",
  "title": "Certificate belongs to a different authority than requested",
  "status": 422,
  "detail": "The certificate was not issued by this certification authority.",
  "instance": "/v3/authorityProvider/certificates/revoke",
  "errorCode": "CERTIFICATE_MISMATCH",
  "correlationId": "c3e5a7b9d1f3b5d7f9a1c3e5b7d9f1a3",
  "timestamp": "2026-10-14T09:37:26Z",
  "retryable": false
}
```
