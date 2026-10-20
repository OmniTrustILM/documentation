---
sidebar_position: 4
---

# RENEWAL_SOURCE_NOT_FOUND

| Property    | Value |
|-------------|-------|
| HTTP status | `404 Not Found` |
| Retryable   | No |
| Error code  | `RENEWAL_SOURCE_NOT_FOUND` |

## Summary

The certification authority cannot find the certificate that the renewal starts from.

## When it occurs

- An [Authority Provider v3](/docs/certificate-key/connectors/provider-interfaces/authority-provider-v3#errors) connector answers it to a renewal or rekey request when the certification authority has no record of the certificate being renewed.

## What the platform does

The renewal fails, and the new certificate ends `Failed`. The certificate being renewed keeps its state, and its history records the failure.

## How to fix

- Check that the certificate was issued by this certification authority. If the authority no longer knows it, issue a new certificate instead of renewing it.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/connector/authority/RENEWAL_SOURCE_NOT_FOUND",
  "title": "Source certificate for renewal not found at upstream CA",
  "status": 404,
  "detail": "The certification authority has no certificate with this serial number and issuer.",
  "instance": "/v3/authorityProvider/certificates/renew",
  "errorCode": "RENEWAL_SOURCE_NOT_FOUND",
  "correlationId": "e1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1",
  "timestamp": "2026-10-14T09:30:52Z",
  "retryable": false
}
```
