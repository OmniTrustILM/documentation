---
sidebar_position: 7
---

# FORBIDDEN

| Property    | Value |
|-------------|-------|
| HTTP status | `403 Forbidden` |
| Retryable   | Yes |
| Error code  | `FORBIDDEN` |

## Summary

The caller is authenticated but does not have permission to perform the requested operation on the specified resource.

## When it occurs

- The authenticated user or certificate lacks the role or permission required for the operation (e.g., trying to delete a resource with a read-only role).
- The resource exists but belongs to a different tenant or organizational unit the caller cannot access.
- An administrator action is attempted by a non-administrator account.
- Access control policies (OPA rules) deny the specific combination of user, action, and resource.

## How to fix

- Verify that the account or certificate used has the required role and permissions for the operation.
- Contact an administrator to grant the necessary permissions if appropriate.
- Confirm you are accessing the correct resource within your authorized scope.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/common/FORBIDDEN",
  "title": "Forbidden",
  "status": 403,
  "detail": "You do not have permission to delete this authority.",
  "instance": "/v1/authorities/a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "errorCode": "FORBIDDEN",
  "correlationId": "4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a",
  "timestamp": "2025-09-08T13:45:00Z",
  "retryable": true,
  "retryAfterSeconds": 30
}
```
