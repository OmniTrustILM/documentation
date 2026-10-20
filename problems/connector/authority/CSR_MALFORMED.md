---
sidebar_position: 1
---

# CSR_MALFORMED

| Property    | Value |
|-------------|-------|
| HTTP status | `422 Unprocessable Entity` |
| Retryable   | No |
| Error code  | `CSR_MALFORMED` |

## Summary

The certificate signing request (CSR) that the request carries cannot be parsed.

## When it occurs

- An [Authority Provider v3](/docs/certificate-key/connectors/provider-interfaces/authority-provider-v3#errors) connector answers it to an issue or renew request whose CSR it or the certification authority cannot parse.

## What the platform does

The issuance or renewal fails, and the requested certificate ends `Failed`. Its history records the connector's `detail`.

## How to fix

- Check that the CSR is complete and in the format the request declares, then submit a new request.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/connector/authority/CSR_MALFORMED",
  "title": "CSR malformed",
  "status": 422,
  "detail": "The CSR cannot be parsed as PKCS#10.",
  "instance": "/v3/authorityProvider/certificates/issue",
  "errorCode": "CSR_MALFORMED",
  "correlationId": "7b9d1f3a5c7e9a1c3e5f7b9d1a3c5e7f",
  "timestamp": "2026-10-14T09:20:04Z",
  "retryable": false
}
```
