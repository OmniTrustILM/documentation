---
sidebar_position: 7
---

# ATTRIBUTE_DEFINITION_NOT_FOUND

| Property    | Value |
|-------------|-------|
| HTTP status | `404 Not Found` |
| Retryable   | No |
| Error code  | `ATTRIBUTE_DEFINITION_NOT_FOUND` |

## Summary

The connector has no attribute definition with the UUID the request names.

## When it occurs

- A connector answers it on its [Attributes v2 API](/docs/contributors/attributes/callbacks#attributes-v2-callback-model), when a definition is read or a callback is resolved for an attribute UUID that its definition registry does not hold, for example after an upgrade changed the connector's attributes.

## What the platform does

The platform fetches the definition from the connector again and retries the callback once. If that does not resolve it, the request fails.

## How to fix

- Load the operation's attributes again, so that the request names attributes the connector offers now, and repeat the request.

**For connector developers:** answer this code, not [RESOURCE_NOT_FOUND](../common/RESOURCE_NOT_FOUND.md), for an attribute UUID your registry does not hold. It is the code that makes the platform fetch the definition again.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/connector/ATTRIBUTE_DEFINITION_NOT_FOUND",
  "title": "Attribute definition not found",
  "status": 404,
  "detail": "No attribute definition with UUID 7c2e4a1b-9d3f-4e5a-8b6c-0d1e2f3a4b5c exists.",
  "instance": "/v2/attributes/callback",
  "errorCode": "ATTRIBUTE_DEFINITION_NOT_FOUND",
  "correlationId": "4a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4b",
  "timestamp": "2026-10-14T08:52:10Z",
  "retryable": false
}
```
