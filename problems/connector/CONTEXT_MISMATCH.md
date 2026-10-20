---
sidebar_position: 11
---

# CONTEXT_MISMATCH

| Property    | Value |
|-------------|-------|
| HTTP status | `422 Unprocessable Entity` |
| Retryable   | No |
| Error code  | `CONTEXT_MISMATCH` |

## Summary

The request contradicts the formatting context it replays from an earlier step of the same signing operation, such as a signature algorithm that differs from the one the context committed to. The request is well formed: what changed is the platform's own state between the two steps.

## When it occurs

- A content-signing formatting connector, which formats PAdES, XAdES, CAdES or JAdES signatures for the platform, answers it when the request to embed a signature value names a different signature algorithm than the formatting context returned when the data to be signed was computed.

## What the platform does

The signing operation fails. The caller receives a general formatting error, and the platform log records the failed step with the connector's `detail`.

## How to fix

- Sign the document again. If the error repeats, report it together with the platform log entry for the failed step.

**For connector developers:** answer this code, not [VALIDATION_FAILED](../common/VALIDATION_FAILED.md), when a well-formed request contradicts the context it replays.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/connector/CONTEXT_MISMATCH",
  "title": "Request contradicts the context it replays",
  "status": 422,
  "detail": "The signature algorithm differs from the one the formatting context committed to.",
  "instance": "/v1/signatureProvider/contentSigning/embedSignatureValue",
  "errorCode": "CONTEXT_MISMATCH",
  "correlationId": "3c5e7a9d1f3b5d7f9a1c3e5b7d9f1a3c",
  "timestamp": "2026-10-14T09:11:57Z",
  "retryable": false
}
```
