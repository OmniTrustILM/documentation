---
sidebar_position: 1
slug: /
---

# Problem Types

This section contains human-readable documentation for every problem type URI that ILM services can return in an [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) `application/problem+json` error response.

When an ILM service returns an error, the response body includes a `type` field — a stable URI that uniquely identifies the problem type. Following that link brings you directly to this documentation.

## Structure

Problem types are grouped by category:

- **[Common](common/)** — General errors that can occur in any ILM service or connector.
- **Connector** — Connector-specific errors (defined per connector).

## Example response

```json
{
  "type": "https://docs.otilm.com/problems/common/VALIDATION_FAILED",
  "title": "Validation failed",
  "status": 422,
  "detail": "One or more fields failed validation.",
  "instance": "/v1/certificates/requests",
  "errorCode": "VALIDATION_FAILED",
  "correlationId": "f5a2e0e0c1ec41d4b7208b5b0c7bc7d9",
  "timestamp": "2025-09-08T12:41:22Z",
  "retryable": true,
  "retryAfterSeconds": 30
}
```

For a full description of the error response format, see [Error Handling](/docs/certificate-key/connectors/common-interfaces/error-handling).
