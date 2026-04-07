---
sidebar_position: 9
---

# OPERATION_NOT_SUPPORTED

| Property    | Value |
|-------------|-------|
| HTTP status | `501 Not Implemented` |
| Retryable   | Yes |
| Error code  | `OPERATION_NOT_SUPPORTED` |

## Summary

The requested operation is not implemented or supported by this connector or service version.

## When it occurs

- Calling an endpoint that exists in the API specification but has not been implemented by the connector.
- Requesting a capability (e.g., key revocation, online certificate status) that the underlying technology does not support.
- Using a feature that requires a higher interface version than the connector implements.
- Invoking an operation on a connector that does not advertise the corresponding interface in its `GET /v2/info` response.

## How to fix

- Check the connector's info endpoint (`GET /v2/connectors/{uuid}/info`) to see which interfaces and feature flags it supports.
- Use an alternative approach or workflow supported by the connector.
- If the operation is essential, consider using a different connector implementation that supports it.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/common/OPERATION_NOT_SUPPORTED",
  "title": "Operation not supported",
  "status": 501,
  "detail": "This connector does not support online certificate revocation.",
  "instance": "/v1/authorities/a1b2c3d4/certificates/revoke",
  "errorCode": "OPERATION_NOT_SUPPORTED",
  "correlationId": "6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
  "timestamp": "2025-09-08T15:10:00Z",
  "retryable": true,
  "retryAfterSeconds": 30
}
```
