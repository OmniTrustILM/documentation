---
sidebar_position: 4
---

# BAD_REQUEST

| Property    | Value |
|-------------|-------|
| HTTP status | `400 Bad Request` |
| Retryable   | Yes |
| Error code  | `BAD_REQUEST` |

## Summary

The server could not understand the request because of malformed syntax, missing required headers, or an otherwise invalid request structure.

## When it occurs

- The request body is not valid JSON or is missing entirely when one is required.
- A required query parameter or header is absent.
- The `Content-Type` header does not match the expected media type.
- The request structure is syntactically valid but semantically nonsensical (e.g., contradictory parameters).

## How to fix

- Ensure the request body is valid JSON and matches the expected schema.
- Check that all required headers (e.g., `Content-Type: application/json`) are present.
- Review the API specification for the endpoint to confirm required parameters and their formats.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/common/BAD_REQUEST",
  "title": "Bad Request",
  "status": 400,
  "detail": "Request body is missing or cannot be parsed as JSON.",
  "instance": "/v1/credentials",
  "errorCode": "BAD_REQUEST",
  "correlationId": "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
  "timestamp": "2025-09-08T09:15:30Z",
  "retryable": true,
  "retryAfterSeconds": 30
}
```
