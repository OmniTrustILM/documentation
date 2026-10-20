---
sidebar_position: 9
---

# DOCUMENT_TOO_LARGE

| Property    | Value |
|-------------|-------|
| HTTP status | `413 Content Too Large` |
| Retryable   | No |
| Error code  | `DOCUMENT_TOO_LARGE` |

## Summary

The document is larger than the connector accepts.

## When it occurs

- A content-signing formatting connector, which formats PAdES, XAdES, CAdES or JAdES signatures for the platform, answers it to a document, a signed document or a replayed formatting context that exceeds its size limit.

## What the platform does

The signing operation fails. The caller receives a general formatting error, and the platform log records the failed step with the connector's `detail`.

## How to fix

- Sign a smaller document.
- To have the platform refuse oversized documents before it calls the connector, set the signing profile's document size cap no higher than the connector's limit.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/connector/DOCUMENT_TOO_LARGE",
  "title": "Document exceeds the size the connector accepts",
  "status": 413,
  "detail": "The document exceeds the 20 MB this connector accepts.",
  "instance": "/v1/signatureProvider/contentSigning/computeDtbs",
  "errorCode": "DOCUMENT_TOO_LARGE",
  "correlationId": "5e7a9c1b3d5f7b9d1a3c5e7a9b1d3f5c",
  "timestamp": "2026-10-14T09:05:16Z",
  "retryable": false
}
```
