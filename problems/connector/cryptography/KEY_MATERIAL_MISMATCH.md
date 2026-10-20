---
sidebar_position: 3
---

# KEY_MATERIAL_MISMATCH

| Property    | Value |
|-------------|-------|
| HTTP status | `422 Unprocessable Entity` |
| Retryable   | No |
| Error code  | `KEY_MATERIAL_MISMATCH` |

## Summary

The key is not of the key type or algorithm the request declares.

## When it occurs

- A [Cryptography Provider v2](/docs/certificate-key/connectors/provider-interfaces/cryptography-provider-v2#errors) connector answers it to a key import whose decrypted material is not the declared key type or algorithm.
- It answers it to a key export when the key the request's key metadata identifies is not the declared key type.

## What the platform does

The platform refuses the import or export and names this code. An import adds no key to the inventory, and an export returns no key material.

## How to fix

- On export, check the key on the token: the platform's record of it no longer matches what the token holds.
- On import, retry. The platform declares the type and algorithm from the key it opened, so a repeated refusal points to the connector; check its logs.

**For connector developers:** compare the declared type and algorithm with the decrypted material on import, and with the key the metadata identifies on export.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/connector/cryptography/KEY_MATERIAL_MISMATCH",
  "title": "Key material does not match the declared key type or algorithm",
  "status": 422,
  "detail": "The addressed key is not the key the request describes.",
  "instance": "/v2/cryptographyProvider/keys/export",
  "errorCode": "KEY_MATERIAL_MISMATCH",
  "correlationId": "4e6a8b0d1f3a5c7e9b1d3f5a7c9e0b2c",
  "timestamp": "2026-10-12T10:17:45Z",
  "retryable": false
}
```
