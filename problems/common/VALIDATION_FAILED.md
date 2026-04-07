---
sidebar_position: 1
---

# VALIDATION_FAILED

| Property    | Value |
|-------------|-------|
| HTTP status | `422 Unprocessable Entity` |
| Retryable   | Yes |
| Error code  | `VALIDATION_FAILED` |

## Summary

One or more fields in the request body or parameters failed validation. The server understood the request but refused to process it because the input does not meet the required constraints.

## When it occurs

- A required field is missing from the request body.
- A field value violates a format rule (e.g., a CSR that is not valid PKCS#10, a UUID that is malformed).
- A field value violates a length, range, or enumeration constraint.
- Attribute values submitted for a connector operation do not conform to the attribute definition.

## How to fix

Inspect the `causes` array in the response body — it is included as an additional property via the `properties` map and appears as a top-level field in the JSON. Each entry identifies the specific field (`name`), the reason it failed (`reason`), and the validation rule that was violated (`rule`). Correct each field and resubmit the request.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/common/VALIDATION_FAILED",
  "title": "Validation failed",
  "status": 422,
  "detail": "One or more fields failed validation.",
  "instance": "/v1/certificates/requests",
  "errorCode": "VALIDATION_FAILED",
  "correlationId": "f5a2e0e0c1ec41d4b7208b5b0c7bc7d9",
  "timestamp": "2025-09-08T12:41:22Z",
  "retryable": true,
  "retryAfterSeconds": 30,
  "causes": [
    {
      "name": "csr",
      "reason": "PEM is not a valid PKCS#10 CSR (base64 decode failed)",
      "rule": "PKCS10.DECODE"
    },
    {
      "name": "subject.commonName",
      "reason": "Common Name exceeds 64 characters",
      "rule": "RFC5280.CN.LENGTH"
    }
  ]
}
```
