---
sidebar_position: 3
---

# PARAMETER_UNSUPPORTED

| Property    | Value |
|-------------|-------|
| HTTP status | `422 Unprocessable Entity` |
| Retryable   | No |
| Error code  | `PARAMETER_UNSUPPORTED` |

## Summary

The connector does not support a parameter the request asks for, such as an algorithm the key cannot use.

## When it occurs

- A [Cryptography Provider v2](/docs/certificate-key/connectors/provider-interfaces/cryptography-provider-v2#errors) connector answers it to a signing, verification, encryption or decryption request whose selected `signatureAlgorithm` or `encryptionAlgorithm`, or another parameter, the key does not support.

## What the platform does

The platform refuses the operation with the connector's answer.

## How to fix

- Repeat the operation with an algorithm or parameter the connector offers for the key.

**For connector developers:** in a cryptographic operation's attribute schema, offer only the algorithms the key supports.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/connector/PARAMETER_UNSUPPORTED",
  "title": "Requested parameter or signature family is not supported by this connector",
  "status": 422,
  "detail": "The key does not support the selected signature algorithm.",
  "instance": "/v2/cryptographyProvider/operations/sign",
  "errorCode": "PARAMETER_UNSUPPORTED",
  "correlationId": "3a5c7e9b1d3f5a7c9e0b2c4e6a8b0d1f",
  "timestamp": "2026-10-12T10:20:15Z",
  "retryable": false
}
```
