---
sidebar_position: 5
---

# CSR_SUBJECT_MISMATCH

| Property    | Value |
|-------------|-------|
| HTTP status | `422 Unprocessable Entity` |
| Retryable   | No |
| Error code  | `CSR_SUBJECT_MISMATCH` |

## Summary

The subject of the certificate signing request (CSR) does not match the identity registered for the certificate.

## When it occurs

- An [Authority Provider v3](/docs/certificate-key/connectors/provider-interfaces/authority-provider-v3#errors) connector answers it to an issuance against a pre-registration when the subject of the CSR differs from the registered identity.

## What the platform does

The issuance fails, and the certificate ends `Failed`. Its history records the connector's `detail`.

## How to fix

- Register the identity again, then issue the certificate with a CSR whose subject matches the registered identity.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/connector/authority/CSR_SUBJECT_MISMATCH",
  "title": "CSR subject does not match the pre-registration",
  "status": 422,
  "detail": "The CSR subject differs from the registered subject.",
  "instance": "/v3/authorityProvider/certificates/issue",
  "errorCode": "CSR_SUBJECT_MISMATCH",
  "correlationId": "b2d4f6a8c0e2a4c6e8b0d2f4a6c8e0b2",
  "timestamp": "2026-10-14T09:34:08Z",
  "retryable": false
}
```
