---
sidebar_position: 12
---

# INTERNAL_SERVER_ERROR

| Property    | Value |
|-------------|-------|
| HTTP status | `500 Internal Server Error` |
| Retryable   | **No** |
| Error code  | `INTERNAL_SERVER_ERROR` |

## Summary

An unexpected error occurred on the server. This is not caused by anything wrong in the request itself — the server encountered an unhandled condition.

## When it occurs

- An unhandled exception was thrown during request processing.
- A software bug or unexpected state caused the operation to fail.
- A required internal resource (e.g., internal configuration, in-memory state) was corrupted or unavailable in an unexpected way.

## How to fix

This error is **not retryable** — repeating the identical request will likely produce the same result.

- Note the `correlationId` from the response and provide it when reporting the issue.
- Check the application logs for a stack trace or error details associated with the correlation ID.
- If the problem persists, report it to the platform administrator or file a bug report with the correlation ID and a description of the operation that triggered the error.

:::info
This is the only common error code where `retryable` is `false`. All other common errors can be retried after addressing the root cause or waiting for the system to recover.
:::

## Example

```json
{
  "type": "https://docs.otilm.com/problems/common/INTERNAL_SERVER_ERROR",
  "title": "Internal server error",
  "status": 500,
  "detail": "An unexpected error occurred. Please contact support with the correlation ID.",
  "instance": "/v1/certificates/abc123/validate",
  "errorCode": "INTERNAL_SERVER_ERROR",
  "correlationId": "9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
  "timestamp": "2025-09-08T19:00:00Z",
  "retryable": false
}
```
