---
sidebar_position: 6
---

# KEY_TYPE_NOT_EXPORTABLE

| Property    | Value |
|-------------|-------|
| HTTP status | `422 Unprocessable Entity` |
| Retryable   | No |
| Error code  | `KEY_TYPE_NOT_EXPORTABLE` |

## Summary

The token does not release a key of this type or algorithm.

## When it occurs

- A [Cryptography Provider v2](/docs/certificate-key/connectors/provider-interfaces/cryptography-provider-v2#errors) connector answers it to a key export whose key type or algorithm its token does not release.

## What the platform does

The platform refuses the export and names this code. No key material is returned.

The platform exports a key only from a token profile whose connector lists the key's type and algorithm as exportable, so this answer means the connector's list and its answer disagree.

## How to fix

- The key cannot be exported from its token.

**For connector developers:** list as exportable only the key types and algorithms the token releases.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/connector/cryptography/KEY_TYPE_NOT_EXPORTABLE",
  "title": "Key type or algorithm cannot be exported from this token",
  "status": 422,
  "detail": "This token does not release secret keys.",
  "instance": "/v2/cryptographyProvider/keys/export",
  "errorCode": "KEY_TYPE_NOT_EXPORTABLE",
  "correlationId": "5a7c9e0b2c4e6a8b0d1f3a5c7e9b1d3f",
  "timestamp": "2026-10-12T10:19:40Z",
  "retryable": false
}
```
