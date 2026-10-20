---
sidebar_position: 8
---

# DOCUMENT_MALFORMED

| Property    | Value |
|-------------|-------|
| HTTP status | `422 Unprocessable Entity` |
| Retryable   | No |
| Error code  | `DOCUMENT_MALFORMED` |

## Summary

The connector cannot parse the document as the format the request declares.

## When it occurs

- A content-signing formatting connector, which formats PAdES, XAdES, CAdES or JAdES signatures for the platform, answers it when the document to sign, or the signed document to timestamp or extend, is not a valid document of the declared format.
- It answers it when it cannot interpret the formatting context that the platform replays from an earlier step of the same signing operation.

## What the platform does

The signing operation fails. The caller receives a general formatting error, and the platform log records the failed step with the connector's `detail`.

## How to fix

- Check that the document is a complete and valid file of the declared format, such as a PDF for a PAdES signature, then sign it again.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/connector/DOCUMENT_MALFORMED",
  "title": "Document cannot be parsed as the declared format",
  "status": 422,
  "detail": "The document is not a valid PDF.",
  "instance": "/v1/signatureProvider/contentSigning/computeDtbs",
  "errorCode": "DOCUMENT_MALFORMED",
  "correlationId": "1b3d5f7a9c0e2a4c6e8b0d2f4a6c8e0b",
  "timestamp": "2026-10-14T09:02:48Z",
  "retryable": false
}
```
