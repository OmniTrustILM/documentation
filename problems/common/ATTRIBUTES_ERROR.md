---
sidebar_position: 5
---

# ATTRIBUTES_ERROR

| Property    | Value |
|-------------|-------|
| HTTP status | `400 Bad Request` |
| Retryable   | Yes |
| Error code  | `ATTRIBUTES_ERROR` |

## Summary

An error occurred while processing attributes. This is distinct from general validation — it specifically indicates a problem with the structure, content, or resolution of [Attributes](/docs/certificate-key/connectors/common-interfaces/attributes-interface) submitted to or returned by a connector.

## When it occurs

- A required attribute is missing from the submitted set.
- An attribute value does not match the expected data type defined by the connector.
- A callback for a dependent attribute (e.g., a list of available keys populated based on a selected token) failed to resolve.
- An attribute UUID does not correspond to a known attribute definition for the given connector and operation.
- The connector rejected the attribute set during server-side validation.

## How to fix

- Fetch the current attribute definitions for the operation using the appropriate `GET /attributes` endpoint on the connector (via Core).
- Ensure all required attributes are present and their values match the declared data types and constraints.
- If a dependent attribute depends on another attribute's value, ensure the dependency is resolved before submitting.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/common/ATTRIBUTES_ERROR",
  "title": "Attributes handling error",
  "status": 400,
  "detail": "Required attribute 'keyAlgorithm' is missing.",
  "instance": "/v1/cryptographyProvider/tokens/abc123/keys",
  "errorCode": "ATTRIBUTES_ERROR",
  "correlationId": "2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
  "timestamp": "2025-09-08T11:30:00Z",
  "retryable": true,
  "retryAfterSeconds": 30
}
```
