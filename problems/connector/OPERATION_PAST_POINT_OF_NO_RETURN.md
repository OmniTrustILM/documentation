---
sidebar_position: 2
---

# OPERATION_PAST_POINT_OF_NO_RETURN

| Property    | Value |
|-------------|-------|
| HTTP status | `422 Unprocessable Entity` |
| Retryable   | No |
| Error code  | `OPERATION_PAST_POINT_OF_NO_RETURN` |

## Summary

The connector refuses to stop or cancel an operation, because the operation has gone too far to be interrupted.

## When it occurs

- A [Discovery Provider v2](/docs/certificate-key/connectors/provider-interfaces/discovery-provider-v2#errors) connector answers it to a stop of a run that has already finished or cannot be checkpointed, or to a cancel of a run it can no longer abort.
- An [Authority Provider v3](/docs/certificate-key/connectors/provider-interfaces/authority-provider-v3#cancel) connector answers it to a cancel the certification authority cannot abort.
- A [Cryptography Provider v2](/docs/certificate-key/connectors/provider-interfaces/cryptography-provider-v2) connector answers it to a cancel of an asynchronous operation that has already ended or can no longer be abandoned.

## What the platform does

The operation is not interrupted and goes on to end on its own. When a user asked for the stop or cancel, the platform refuses the request with the same status.

## How to fix

- Wait for the operation to end, then act on its result, for example by deleting a finished discovery or revoking a certificate that was issued.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/connector/OPERATION_PAST_POINT_OF_NO_RETURN",
  "title": "Cancel refused — operation past point of no return",
  "status": 422,
  "detail": "Discovery run 5f0c2a3e-8d1b-4c7a-9e2f-6b3d4a5c6e7f has already finished and can no longer be stopped.",
  "instance": "/v2/discoveryProvider/discoveries/stop",
  "errorCode": "OPERATION_PAST_POINT_OF_NO_RETURN",
  "correlationId": "1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e",
  "timestamp": "2026-10-05T09:15:02Z",
  "retryable": false
}
```
