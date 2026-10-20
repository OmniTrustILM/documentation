---
sidebar_position: 3
---

# REGISTRATION_NOT_FOUND

| Property    | Value |
|-------------|-------|
| HTTP status | `422 Unprocessable Entity` |
| Retryable   | No |
| Error code  | `REGISTRATION_NOT_FOUND` |

## Summary

The certification authority does not track the pre-registration that the request refers to.

## When it occurs

- An [Authority Provider v3](/docs/certificate-key/connectors/provider-interfaces/authority-provider-v3#errors) connector answers it to a request that replays a registration's `meta`, such as an issuance against the registration or a status or cancel request, when the certification authority no longer tracks the registration.

## What the platform does

The platform does not retry. A cancel goes ahead in the platform, as for [OPERATION_NOT_TRACKED](../OPERATION_NOT_TRACKED.md). A status poll or an issuance against the registration fails, and the certificate ends `Failed`.

## How to fix

- Register the identity again, then issue the certificate against the new registration.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/connector/authority/REGISTRATION_NOT_FOUND",
  "title": "Pre-registration reference not tracked by upstream CA",
  "status": 422,
  "detail": "The certification authority has no registration with this reference.",
  "instance": "/v3/authorityProvider/certificates/register/status",
  "errorCode": "REGISTRATION_NOT_FOUND",
  "correlationId": "5d7f9b1c3e5a7c9e1b3d5f7a9c1e3b5d",
  "timestamp": "2026-10-14T09:27:15Z",
  "retryable": false
}
```
