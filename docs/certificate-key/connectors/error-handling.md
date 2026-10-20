---
sidebar_position: 12
---

# Error Handling

## Overview

All Connector NG implementations use a standardized error response format based on [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457). This ensures consistent, machine-actionable, and human-readable error information across all connectors and their upstream systems.

## Media type

Error responses use the `application/problem+json` content type (per RFC 9457 §6.1). The HTTP status code **must** be `4xx` or `5xx`.

```
Content-Type: application/problem+json
```

:::note
`application/problem+xml` is not supported.
:::

## Problem object

Each error response body is a JSON object with the following fields:

| Field      | Type   | Required | Description                                                                                           |
|------------|--------|----------|-------------------------------------------------------------------------------------------------------|
| `type`     | string | yes      | A URI reference identifying the problem type. Resolves to a documentation page on this site.         |
| `title`    | string | no       | Short, human-readable summary of the problem type (does not change between occurrences).              |
| `status`   | number | yes      | HTTP status code. **Must match** the actual response status code.                                     |
| `detail`   | string | no       | Human-readable explanation specific to this occurrence of the problem.                                |
| `instance` | string | no       | A URI reference that identifies the specific occurrence (e.g., request path or operation ID).         |

## ILM extensions

In addition to the standard fields, ILM connectors include the following extension properties:

| Extension          | Type    | Required | Description                                                                                                   |
|--------------------|---------|----------|---------------------------------------------------------------------------------------------------------------|
| `errorCode`        | string  | yes      | Stable error code from the `ErrorCode` enum (e.g., `VALIDATION_FAILED`).                                     |
| `timestamp`        | string  | yes      | ISO 8601 / RFC 3339 timestamp of when the error occurred.                                                     |
| `retryable`        | boolean | yes      | Whether the same request can be safely retried. It follows the error code, see [Problem types](#problem-types). |
| `correlationId`    | string  | no       | Trace identifier from `X-Request-Id` or W3C Trace Context, used for cross-system correlation.                |
| `retryAfterSeconds`| integer | no       | Backoff hint in seconds before retrying. Present only when `retryable` is `true` (default: `30`).           |

### Additional properties

Beyond the fixed extension fields above, `ProblemDetailExtended` exposes a generic `properties` map (inherited from Spring's `ProblemDetail`). Implementations use this map to attach any additional context relevant to the specific error. Per RFC 9457, these entries are serialized as top-level members of the JSON object alongside the standard fields.

A common example is a `causes` array added for validation errors, where each entry describes one failed field:

| Property key | Value type | Example use |
|---|---|---|
| `causes` | array of objects | Per-field validation failures (see [VALIDATION_FAILED](/problems/common/VALIDATION_FAILED)) |

Each `causes` entry typically contains:

| Field    | Type   | Description                                                                        |
|----------|--------|------------------------------------------------------------------------------------|
| `name`   | string | Field or parameter that failed (e.g., `csr`, `subject.commonName`)                |
| `reason` | string | Human-readable explanation of why it failed                                        |
| `rule`   | string | Machine-readable rule identifier (e.g., `PKCS10.DECODE`, `RFC5280.CN.LENGTH`)     |

Other implementations may add different properties relevant to their error type.

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
  "retryable": false,
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

The `causes` array appears as a top-level property in the JSON because Spring's `ProblemDetail` flattens the `properties` map into the response body.

## Problem types

Problem type URIs follow the pattern `https://docs.otilm.com/problems/{category}/{ERROR_CODE}`, where `ERROR_CODE` is the exact name of the `ErrorCode` enum value. Each URI resolves to a documentation page with a full description, common causes, and remediation steps.

Only `REQUEST_TIMEOUT`, `RATE_LIMIT_EXCEEDED`, `SERVICE_UNAVAILABLE` and `GATEWAY_TIMEOUT` are retryable.

### Common types

These problem types are shared across all ILM services and connectors:

| Error code | Type URI | HTTP Status | Retryable | Description |
|---|---|---|---|---|
| [`VALIDATION_FAILED`](/problems/common/VALIDATION_FAILED) | `/common/VALIDATION_FAILED` | 422 | no | One or more input fields failed validation |
| [`RESOURCE_NOT_FOUND`](/problems/common/RESOURCE_NOT_FOUND) | `/common/RESOURCE_NOT_FOUND` | 404 | no | The requested resource does not exist |
| [`RESOURCE_ALREADY_EXISTS`](/problems/common/RESOURCE_ALREADY_EXISTS) | `/common/RESOURCE_ALREADY_EXISTS` | 409 | no | A resource with the same identifier already exists |
| [`BAD_REQUEST`](/problems/common/BAD_REQUEST) | `/common/BAD_REQUEST` | 400 | no | Malformed or structurally invalid request |
| [`ATTRIBUTES_ERROR`](/problems/common/ATTRIBUTES_ERROR) | `/common/ATTRIBUTES_ERROR` | 400 | no | Error processing connector attributes |
| [`UNAUTHORIZED`](/problems/common/UNAUTHORIZED) | `/common/UNAUTHORIZED` | 401 | no | Authentication credentials missing or invalid |
| [`FORBIDDEN`](/problems/common/FORBIDDEN) | `/common/FORBIDDEN` | 403 | no | Authenticated but not authorized for this operation |
| [`REQUEST_TIMEOUT`](/problems/common/REQUEST_TIMEOUT) | `/common/REQUEST_TIMEOUT` | 408 | yes | Operation timed out waiting for upstream response |
| [`OPERATION_NOT_SUPPORTED`](/problems/common/OPERATION_NOT_SUPPORTED) | `/common/OPERATION_NOT_SUPPORTED` | 501 | no | Operation is not implemented by this connector |
| [`RATE_LIMIT_EXCEEDED`](/problems/common/RATE_LIMIT_EXCEEDED) | `/common/RATE_LIMIT_EXCEEDED` | 429 | yes | Too many requests in the allowed time window |
| [`SERVICE_UNAVAILABLE`](/problems/common/SERVICE_UNAVAILABLE) | `/common/SERVICE_UNAVAILABLE` | 503 | yes | Service or a critical dependency is temporarily unavailable |
| [`GATEWAY_TIMEOUT`](/problems/common/GATEWAY_TIMEOUT) | `/common/GATEWAY_TIMEOUT` | 504 | yes | An upstream system did not answer in time |
| [`INTERNAL_SERVER_ERROR`](/problems/common/INTERNAL_SERVER_ERROR) | `/common/INTERNAL_SERVER_ERROR` | 500 | no | Unexpected server error — report with correlation ID |

### Connector types

These problem types belong to connector operations. A type specific to one interface carries the interface in its URI, `https://docs.otilm.com/problems/connector/{interface}/{ERROR_CODE}`:

| Error code | Type URI | HTTP Status | Retryable | Description |
|---|---|---|---|---|
| [`UPSTREAM_ERROR`](/problems/connector/UPSTREAM_ERROR) | `/connector/UPSTREAM_ERROR` | 502 | no | The connector's upstream system returned an error |
| [`CREDENTIAL_INVALID`](/problems/connector/CREDENTIAL_INVALID) | `/connector/CREDENTIAL_INVALID` | 401 | no | The upstream system refused the credentials the connector presented |
| [`POLICY_VIOLATION`](/problems/connector/POLICY_VIOLATION) | `/connector/POLICY_VIOLATION` | 422 | no | A policy of the upstream system refused the request |
| [`OPERATION_PAST_POINT_OF_NO_RETURN`](/problems/connector/OPERATION_PAST_POINT_OF_NO_RETURN) | `/connector/OPERATION_PAST_POINT_OF_NO_RETURN` | 422 | no | The operation has gone too far to be stopped or cancelled |
| [`OPERATION_NOT_TRACKED`](/problems/connector/OPERATION_NOT_TRACKED) | `/connector/OPERATION_NOT_TRACKED` | 404 | no | The connector does not track the operation the request refers to |
| [`ATTRIBUTE_DEFINITION_NOT_FOUND`](/problems/connector/ATTRIBUTE_DEFINITION_NOT_FOUND) | `/connector/ATTRIBUTE_DEFINITION_NOT_FOUND` | 404 | no | The connector has no attribute definition with the requested UUID |
| [`DOCUMENT_MALFORMED`](/problems/connector/DOCUMENT_MALFORMED) | `/connector/DOCUMENT_MALFORMED` | 422 | no | The document cannot be parsed as the declared format |
| [`DOCUMENT_TOO_LARGE`](/problems/connector/DOCUMENT_TOO_LARGE) | `/connector/DOCUMENT_TOO_LARGE` | 413 | no | The document exceeds the size the connector accepts |
| [`SIGNATURE_NOT_FOUND`](/problems/connector/SIGNATURE_NOT_FOUND) | `/connector/SIGNATURE_NOT_FOUND` | 422 | no | The document has no signature the operation can act on |
| [`PARAMETER_UNSUPPORTED`](/problems/connector/PARAMETER_UNSUPPORTED) | `/connector/PARAMETER_UNSUPPORTED` | 422 | no | A requested parameter, such as an algorithm, is not supported |
| [`CONTEXT_MISMATCH`](/problems/connector/CONTEXT_MISMATCH) | `/connector/CONTEXT_MISMATCH` | 422 | no | The request contradicts the context it replays |
| [`CSR_MALFORMED`](/problems/connector/authority/CSR_MALFORMED) | `/connector/authority/CSR_MALFORMED` | 422 | no | The CSR cannot be parsed |
| [`REVOCATION_NOT_ALLOWED`](/problems/connector/authority/REVOCATION_NOT_ALLOWED) | `/connector/authority/REVOCATION_NOT_ALLOWED` | 422 | no | The certification authority does not allow the revocation |
| [`REGISTRATION_NOT_FOUND`](/problems/connector/authority/REGISTRATION_NOT_FOUND) | `/connector/authority/REGISTRATION_NOT_FOUND` | 422 | no | The certification authority does not track the registration |
| [`RENEWAL_SOURCE_NOT_FOUND`](/problems/connector/authority/RENEWAL_SOURCE_NOT_FOUND) | `/connector/authority/RENEWAL_SOURCE_NOT_FOUND` | 404 | no | The certification authority cannot find the certificate to renew |
| [`CSR_SUBJECT_MISMATCH`](/problems/connector/authority/CSR_SUBJECT_MISMATCH) | `/connector/authority/CSR_SUBJECT_MISMATCH` | 422 | no | The CSR subject does not match the registration |
| [`CERTIFICATE_MISMATCH`](/problems/connector/authority/CERTIFICATE_MISMATCH) | `/connector/authority/CERTIFICATE_MISMATCH` | 422 | no | The certificate belongs to a different authority than requested |
| [`CHECKPOINT_LOST`](/problems/connector/discovery/CHECKPOINT_LOST) | `/connector/discovery/CHECKPOINT_LOST` | 410 | no | A stopped discovery run cannot be resumed from its checkpoint |
| [`KEY_TYPE_NOT_IMPORTABLE`](/problems/connector/cryptography/KEY_TYPE_NOT_IMPORTABLE) | `/connector/cryptography/KEY_TYPE_NOT_IMPORTABLE` | 422 | no | The token cannot hold a key of that type or algorithm |
| [`KEY_TYPE_NOT_EXPORTABLE`](/problems/connector/cryptography/KEY_TYPE_NOT_EXPORTABLE) | `/connector/cryptography/KEY_TYPE_NOT_EXPORTABLE` | 422 | no | The token does not release a key of that type or algorithm |
| [`KEY_MATERIAL_MISMATCH`](/problems/connector/cryptography/KEY_MATERIAL_MISMATCH) | `/connector/cryptography/KEY_MATERIAL_MISMATCH` | 422 | no | The key is not the declared key type or algorithm |
| [`KEY_DECRYPTION_FAILED`](/problems/connector/cryptography/KEY_DECRYPTION_FAILED) | `/connector/cryptography/KEY_DECRYPTION_FAILED` | 422 | no | The key material does not decrypt with the supplied passphrase |
| [`EXPORTABLE_NOT_SUPPORTED`](/problems/connector/cryptography/EXPORTABLE_NOT_SUPPORTED) | `/connector/cryptography/EXPORTABLE_NOT_SUPPORTED` | 422 | no | The token cannot hold a key that stays exportable |
| [`KEY_NOT_EXPORTABLE`](/problems/connector/cryptography/KEY_NOT_EXPORTABLE) | `/connector/cryptography/KEY_NOT_EXPORTABLE` | 422 | no | The key was not created or imported as exportable |
