---
sidebar_position: 2
---

# REVOCATION_NOT_ALLOWED

| Property    | Value |
|-------------|-------|
| HTTP status | `422 Unprocessable Entity` |
| Retryable   | No |
| Error code  | `REVOCATION_NOT_ALLOWED` |

## Summary

The certification authority does not allow the certificate to be revoked.

## When it occurs

- An [Authority Provider v3](/docs/certificate-key/connectors/provider-interfaces/authority-provider-v3#errors) connector answers it to a revoke request that the certification authority refuses.

## What the platform does

The certificate is not revoked, and its history records that the authority rejected the revocation.

## How to fix

- Find out why the certification authority refuses the revocation, for example from its revocation policy, and revoke the certificate once the authority allows it.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/connector/authority/REVOCATION_NOT_ALLOWED",
  "title": "Revocation not allowed by upstream CA",
  "status": 422,
  "detail": "The certification authority does not allow this certificate to be revoked.",
  "instance": "/v3/authorityProvider/certificates/revoke",
  "errorCode": "REVOCATION_NOT_ALLOWED",
  "correlationId": "0c2e4a6b8d0f2b4d6f8a0c2e4b6d8f0a",
  "timestamp": "2026-10-14T09:23:41Z",
  "retryable": false
}
```
