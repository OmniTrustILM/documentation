---
sidebar_position: 2
---

# RESOURCE_NOT_FOUND

| Property    | Value |
|-------------|-------|
| HTTP status | `404 Not Found` |
| Retryable   | Yes |
| Error code  | `RESOURCE_NOT_FOUND` |

## Summary

The requested resource does not exist or is not accessible with the current credentials.

## When it occurs

- A UUID or identifier in the URL path refers to a resource that has been deleted or never existed.
- The resource exists but is in a different namespace, tenant, or the caller does not have permission to know of its existence (the platform may return 404 instead of 403 to avoid information leakage).
- A dependent resource referenced in the request body (e.g., a connector UUID, a credential UUID) cannot be found.

## How to fix

- Verify the UUID or identifier in the request URL.
- Confirm the resource exists using a list or search operation before referencing it.
- Check that you are authenticated with the correct user or certificate that has access to the resource.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/common/RESOURCE_NOT_FOUND",
  "title": "Resource not found",
  "status": 404,
  "detail": "Authority with UUID 'a1b2c3d4-...' was not found.",
  "instance": "/v1/authorities/a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "errorCode": "RESOURCE_NOT_FOUND",
  "correlationId": "3d8e1a2b4c5f6e7d8a9b0c1d2e3f4a5b",
  "timestamp": "2025-09-08T14:20:00Z",
  "retryable": true,
  "retryAfterSeconds": 30
}
```
