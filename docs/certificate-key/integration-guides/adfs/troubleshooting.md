---
sidebar_position: 40
---

# Troubleshooting

## Keycloak

You can enable DEBUG logs in Keycloak to troubleshoot the integration with AD FS. To do so, set environment variable `KC_LOG_LEVEL` to value `INFO,org.keycloak.saml:DEBUG,org.keycloak.broker.saml:DEBUG` before Keycloak starts. With those settings, Keycloak will log all SAML messages which are being exchanged between Keycloak and AD FS.

## AD FS

Logs from AD FS can be helpful to troubleshoot the integration. You can view logs in the `Event Viewer` under `Applications and Services Logs` and `AD FS`. You can also enable verbose logging in AD FS by running the following PowerShell command:

```powershell
Set-AdfsProperties -LogLevel Verbose
```

## CZERTAINLY

You can enable DEBUG logs in CZERTAINLY to troubleshoot the integration with AD FS. To do so, set environment variable `KONG_LOG_LEVEL` to value `debug` of the API gateway that is handling the OIDC requests. You can enable DEBUG logs using Helm chart by setting `apiGateway.logging.level` to `debug` and redeploying the Helm chart.

```JSON
{
  "jti": "388439a9-72a1-4eb2-be37-0e0d89d71049",
  "auth_time": 1712665283,
  "given_name": "John",
  "family_name": "Doe",
  "email": "john.doe@example.com",
  "acr": "1",
  "session_state": "cd740fda-dea5-4a91-8cc8-fbe4c4c957ec",
  "roles": [
    "admin",
    "user",
    "manager"
  ],
  "iss": "https://keycloak.example.com/realms/CZERTAINLY",
  "aud": "kong",
  "iat": 1712665284,
  "azp": "kong",
  "at_hash": "5s3DYMIPAxf5-GIwRJGdtA",
  "sub": "eff98879-4e25-4255-abbf-b6c5d77cb6ad",
  "sid": "cd740fda-dea5-4a91-8cc8-fbe4c4c957ec",
  "email_verified": false,
  "exp": 1712665584,
  "typ": "ID",
  "nonce": "d51bca31432cb728afe3ac0924a4bfdd",
  "name": "John Doe",
  "preferred_username": "example\\john.doe"
}
```
