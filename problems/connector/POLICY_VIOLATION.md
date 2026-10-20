---
sidebar_position: 6
---

# POLICY_VIOLATION

| Property    | Value |
|-------------|-------|
| HTTP status | `422 Unprocessable Entity` |
| Retryable   | No |
| Error code  | `POLICY_VIOLATION` |

## Summary

The connector's upstream system, such as a certification authority or an HSM, refused the request because one of its own policies does not allow it.

## When it occurs

- A certification authority's policy refuses the request.
- A token does not allow a key to be used for the requested operation.

## What the platform does

The operation fails.

## How to fix

- Check the upstream system's policy for the object and the operation, then change the request, or the policy, and repeat the operation.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/connector/POLICY_VIOLATION",
  "title": "Policy violation at upstream system",
  "status": 422,
  "detail": "The token does not allow this key to sign.",
  "instance": "/v2/cryptographyProvider/operations/sign",
  "errorCode": "POLICY_VIOLATION",
  "correlationId": "8d0f2b4c6e8a1c3d5f7b9e1a3c5d7f9b",
  "timestamp": "2026-10-14T08:47:33Z",
  "retryable": false
}
```
