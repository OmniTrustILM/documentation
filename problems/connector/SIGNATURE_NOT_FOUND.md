---
sidebar_position: 10
---

# SIGNATURE_NOT_FOUND

| Property    | Value |
|-------------|-------|
| HTTP status | `422 Unprocessable Entity` |
| Retryable   | No |
| Error code  | `SIGNATURE_NOT_FOUND` |

## Summary

The document contains no signature that the operation can act on.

## When it occurs

- A content-signing formatting connector, which formats PAdES, XAdES, CAdES or JAdES signatures for the platform, answers it to a request to timestamp or extend a signature when the signed document carries no signature to act on.

## What the platform does

The signing operation fails. The caller receives a general formatting error, and the platform log records the failed step with the connector's `detail`.

## How to fix

- Repeat the operation with a document that carries a signature of the declared format.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/connector/SIGNATURE_NOT_FOUND",
  "title": "Document contains no signature this operation can act on",
  "status": 422,
  "detail": "The document carries no signature to timestamp.",
  "instance": "/v1/signatureProvider/contentSigning/computeSignatureTimestampImprint",
  "errorCode": "SIGNATURE_NOT_FOUND",
  "correlationId": "9a1c3e5b7d9f1b3d5a7c9e1b3d5f7a9c",
  "timestamp": "2026-10-14T09:08:39Z",
  "retryable": false
}
```
