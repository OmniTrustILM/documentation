---
sidebar_position: 2
---

# KEY_DECRYPTION_FAILED

| Property    | Value |
|-------------|-------|
| HTTP status | `422 Unprocessable Entity` |
| Retryable   | No |
| Error code  | `KEY_DECRYPTION_FAILED` |

## Summary

The connector could not open the protected key material with the passphrase the import request carries.

## When it occurs

- A [Cryptography Provider v2](/docs/certificate-key/connectors/provider-interfaces/cryptography-provider-v2#errors) connector answers it to a key import whose envelope does not decrypt with the supplied passphrase.

## What the platform does

The platform refuses the import and names this code. No key is added to the inventory.

The platform opens the file the user supplies before anything is sent, and refuses a wrong file password itself. It then protects the key again under a passphrase it generates for the request, so this answer does not mean the file password was wrong.

## How to fix

- Retry the import. If it fails again, check the connector's logs.

**For connector developers:** answer this code only for an envelope that does not decrypt. An envelope outside the protection profile is a [VALIDATION_FAILED](../../common/VALIDATION_FAILED.md).

## Example

```json
{
  "type": "https://docs.otilm.com/problems/connector/cryptography/KEY_DECRYPTION_FAILED",
  "title": "Key material could not be decrypted with the supplied passphrase",
  "status": 422,
  "detail": "No key could be read out of the supplied material.",
  "instance": "/v2/cryptographyProvider/keys/import",
  "errorCode": "KEY_DECRYPTION_FAILED",
  "correlationId": "7b9d1f3a5c7e9b1d3f5a7c9e0b2c4e6a",
  "timestamp": "2026-10-12T10:16:02Z",
  "retryable": false
}
```
