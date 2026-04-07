---
sidebar_position: 8
---

# REQUEST_TIMEOUT

| Property    | Value |
|-------------|-------|
| HTTP status | `408 Request Timeout` |
| Retryable   | Yes |
| Error code  | `REQUEST_TIMEOUT` |

## Summary

The server did not receive a complete request within the allowed time window, or an operation timed out while waiting for an upstream system to respond.

## When it occurs

- A connector call to an upstream CA, HSM, or directory service did not respond within the configured timeout.
- A long-running operation (e.g., certificate issuance against a slow CA) exceeded the request deadline.
- Network latency or connectivity issues caused the upstream system to be unreachable within the timeout.

## How to fix

- Retry the request — the `retryAfterSeconds` field indicates how long to wait before retrying.
- If the timeout is consistently triggered, check the connectivity between the platform and the upstream system.
- Consider whether the upstream system is overloaded or temporarily unavailable.
- For persistent issues, check the connector's health status via `GET /v2/connectors/{uuid}/health`.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/common/REQUEST_TIMEOUT",
  "title": "Request timeout",
  "status": 408,
  "detail": "The upstream CA did not respond within the 30-second timeout.",
  "instance": "/v1/authorities/a1b2c3d4/certificates/issue",
  "errorCode": "REQUEST_TIMEOUT",
  "correlationId": "5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
  "timestamp": "2025-09-08T16:00:00Z",
  "retryable": true,
  "retryAfterSeconds": 30
}
```
