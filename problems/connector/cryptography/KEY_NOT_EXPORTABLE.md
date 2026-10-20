---
sidebar_position: 5
---

# KEY_NOT_EXPORTABLE

| Property    | Value |
|-------------|-------|
| HTTP status | `422 Unprocessable Entity` |
| Retryable   | No |
| Error code  | `KEY_NOT_EXPORTABLE` |

## Summary

The key was not created or imported as exportable, so it cannot leave its token.

## When it occurs

- A [Cryptography Provider v2](/docs/certificate-key/connectors/provider-interfaces/cryptography-provider-v2#errors) connector answers it to a key export of a key the technology holds as not extractable.

## What the platform does

The platform refuses the export and names this code. No key material is returned.

The platform exports only a key it records as exportable, so this answer means the token holds the key as not extractable although the platform's record says otherwise.

## How to fix

- The key cannot be exported. A key's exportable flag is set once, when the key is created or imported, and cannot be raised later. To have an exportable key, create or import a new one as exportable.

**For connector developers:** map the exportable intent to the technology's extractability control when the key is created or imported, and refuse an exportable request the token cannot honor with [EXPORTABLE_NOT_SUPPORTED](EXPORTABLE_NOT_SUPPORTED.md).

## Example

```json
{
  "type": "https://docs.otilm.com/problems/connector/cryptography/KEY_NOT_EXPORTABLE",
  "title": "Key was not created or imported as exportable",
  "status": 422,
  "detail": "The key was not made exportable and cannot leave the token.",
  "instance": "/v2/cryptographyProvider/keys/export",
  "errorCode": "KEY_NOT_EXPORTABLE",
  "correlationId": "1d3f5a7c9e0b2c4e6a8b0d1f3a5c7e9b",
  "timestamp": "2026-10-12T10:19:05Z",
  "retryable": false
}
```
