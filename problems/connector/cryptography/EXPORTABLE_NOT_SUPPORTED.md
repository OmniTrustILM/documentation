---
sidebar_position: 4
---

# EXPORTABLE_NOT_SUPPORTED

| Property    | Value |
|-------------|-------|
| HTTP status | `422 Unprocessable Entity` |
| Retryable   | No |
| Error code  | `EXPORTABLE_NOT_SUPPORTED` |

## Summary

The token cannot hold a key that stays exportable, so the connector refuses to create or import the key as exportable.

## When it occurs

- A [Cryptography Provider v2](/docs/certificate-key/connectors/provider-interfaces/cryptography-provider-v2#errors) connector answers it to a key creation that asks for an exportable key through the `keyExportable` attribute, or to a key import with `exportable` set, when the token forbids extractable keys.

## What the platform does

The creation or import fails, and no key is created on the token or added to the inventory.

## How to fix

- Create or import the key as not exportable, or use a token profile whose token allows exportable keys. A key's exportable flag is set once and cannot be raised later.

**For connector developers:** refuse the request rather than create or import a key whose exportable flag the token cannot deliver.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/connector/cryptography/EXPORTABLE_NOT_SUPPORTED",
  "title": "Token cannot hold a key that stays exportable",
  "status": 422,
  "detail": "This token does not allow extractable keys.",
  "instance": "/v2/cryptographyProvider/keys",
  "errorCode": "EXPORTABLE_NOT_SUPPORTED",
  "correlationId": "9e0b2c4e6a8b0d1f3a5c7e9b1d3f5a7c",
  "timestamp": "2026-10-12T10:18:20Z",
  "retryable": false
}
```
