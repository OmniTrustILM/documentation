---
sidebar_position: 1
---

# KEY_TYPE_NOT_IMPORTABLE

| Property    | Value |
|-------------|-------|
| HTTP status | `422 Unprocessable Entity` |
| Retryable   | No |
| Error code  | `KEY_TYPE_NOT_IMPORTABLE` |

## Summary

The token cannot hold a key of the type or algorithm the import brings.

## When it occurs

- A [Cryptography Provider v2](/docs/certificate-key/connectors/provider-interfaces/cryptography-provider-v2#errors) connector answers it to a key import whose key type or algorithm its token does not accept.

## What the platform does

The platform refuses the import and names this code. No key is added to the inventory.

The platform imports a key only into a token profile whose connector lists the key's type and algorithm as importable, so this answer means the connector's list and its answer disagree.

## How to fix

- Import the key into a token profile whose token accepts its type and algorithm.

**For connector developers:** list as importable only the key types and algorithms the token accepts.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/connector/cryptography/KEY_TYPE_NOT_IMPORTABLE",
  "title": "Key type or algorithm cannot be imported into this token",
  "status": 422,
  "detail": "This token does not accept ML-DSA key pairs.",
  "instance": "/v2/cryptographyProvider/keys/import",
  "errorCode": "KEY_TYPE_NOT_IMPORTABLE",
  "correlationId": "2c4e6a8b0d1f3a5c7e9b1d3f5a7c9e0b",
  "timestamp": "2026-10-12T10:15:30Z",
  "retryable": false
}
```
