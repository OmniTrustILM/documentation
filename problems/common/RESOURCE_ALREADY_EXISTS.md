---
sidebar_position: 3
---

# RESOURCE_ALREADY_EXISTS

| Property    | Value |
|-------------|-------|
| HTTP status | `409 Conflict` |
| Retryable   | Yes |
| Error code  | `RESOURCE_ALREADY_EXISTS` |

## Summary

The operation cannot be completed because a resource with the same unique identifier or name already exists.

## When it occurs

- Creating a resource (e.g., an Authority, Credential, or Discovery) with a name that is already in use.
- Attempting to register a connector that is already registered at the same URL.
- Importing or adding an object that conflicts with an existing one on a unique key.

## How to fix

- Use a different, unique name for the resource you are creating.
- If you intended to update an existing resource, use the appropriate `PUT` or `PATCH` endpoint instead of `POST`.
- If the existing resource is stale or should be replaced, delete it first and then retry the creation.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/common/RESOURCE_ALREADY_EXISTS",
  "title": "Resource already exists",
  "status": 409,
  "detail": "Authority with name 'My CA' already exists.",
  "instance": "/v1/authorities",
  "errorCode": "RESOURCE_ALREADY_EXISTS",
  "correlationId": "9c8b7a6d5e4f3c2b1a0d9e8f7c6b5a4d",
  "timestamp": "2025-09-08T10:05:11Z",
  "retryable": true,
  "retryAfterSeconds": 30
}
```
