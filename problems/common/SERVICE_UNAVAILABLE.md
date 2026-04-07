---
sidebar_position: 11
---

# SERVICE_UNAVAILABLE

| Property    | Value |
|-------------|-------|
| HTTP status | `503 Service Unavailable` |
| Retryable   | Yes |
| Error code  | `SERVICE_UNAVAILABLE` |

## Summary

The service or a critical dependency is temporarily unavailable and cannot process requests right now.

## When it occurs

- The connector reports `DOWN` or `OUT_OF_SERVICE` status on its health endpoint.
- A required dependency (database, HSM, upstream CA) is unreachable.
- The service is starting up or undergoing maintenance.
- The connector's readiness probe is failing, indicating it is not ready to serve traffic.

## How to fix

- Retry after the interval indicated in `retryAfterSeconds`.
- Check the connector health using `GET /v2/connectors/{uuid}/health` — the `components` map will identify which dependency is failing.
- If the issue persists, review the connector logs and verify network connectivity to dependent services.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/common/SERVICE_UNAVAILABLE",
  "title": "Service unavailable",
  "status": 503,
  "detail": "The connector's HSM dependency is currently unreachable.",
  "instance": "/v1/cryptographyProvider/tokens",
  "errorCode": "SERVICE_UNAVAILABLE",
  "correlationId": "8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",
  "timestamp": "2025-09-08T18:00:00Z",
  "retryable": true,
  "retryAfterSeconds": 30
}
```
