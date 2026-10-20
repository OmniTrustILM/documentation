---
sidebar_position: 13
---

# GATEWAY_TIMEOUT

| Property    | Value |
|-------------|-------|
| HTTP status | `504 Gateway Timeout` |
| Retryable   | Yes |
| Error code  | `GATEWAY_TIMEOUT` |

## Summary

The service passed the request on to a system it depends on, such as a certification authority or an HSM, and did not get an answer in time.

## When it occurs

- A connector did not get an answer from its upstream system, or from a component in front of it, within its timeout.
- The upstream system is overloaded, or the network path to it is slow or interrupted.

## How to fix

- Retry after the interval indicated in `retryAfterSeconds`.
- If the timeout persists, check the connectivity between the connector and its upstream system, and the connector's health using `GET /v2/connectors/{uuid}/health`.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/common/GATEWAY_TIMEOUT",
  "title": "Gateway timeout",
  "status": 504,
  "detail": "The HSM did not answer within the request timeout.",
  "instance": "/v2/cryptographyProvider/operations/sign",
  "errorCode": "GATEWAY_TIMEOUT",
  "correlationId": "0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
  "timestamp": "2026-10-14T08:30:12Z",
  "retryable": true,
  "retryAfterSeconds": 30
}
```
