---
sidebar_position: 5
---

# Identification

Each user is identified by one of the supported methods listed below:

- X.509 certificate
- JWT

Identification is performed by the [authentication service](https://github.com/OmniTrustILM/auth).

## X.509 certificate

A user is identified by the exact client leaf certificate associated with the user; the issuing intermediate or root CA cannot substitute for the leaf.

Certificate sign-in validates the certificate chain and requires an enabled user. The [Identify User](/api/core-auth#tag/user-management/POST/v1/users/identify) operation only looks up the user by certificate fingerprint; it does not validate trust.

To set up certificate sign-in, follow [Client Certificate Authentication](../../../installation-guide/deployment/client-certificate-authentication.md). A request whose certificate fails validation is rejected without trying JWT; a request without a certificate proceeds to JWT.

## JSON Web Token (JWT)

User can be identified using JWT. To enable JWT identification, OAuth 2.0 Provider which issued the token must be configured in settings, see [OAuth2 Provider Settings](../../../integration-guides/keycloak/provider-settings.md).

Following claims in the payload of a JWT will be consired during the process of authentication:

| Item          | Data type          | Description                                                   | Required                                      |
|---------------|--------------------|---------------------------------------------------------------|-----------------------------------------------|
| `sub`         | `string`           | Unique identification of the user in the external system      | <span class="badge badge--success">YES</span> |
| `iss`         | `string`           | URL of the provider issuing the token                         | <span class="badge badge--success">YES</span> |
| `username`    | `string`           | Username of the user, username must be unique in the platform | <span class="badge badge--success">YES</span> |
| `given_name`  | `string`           | Given name of the user                                        | <span class="badge badge--danger">NO</span>   |
| `family_name` | `string`           | Family name of the user                                       | <span class="badge badge--danger">NO</span>   |
| `email`       | `string`           | Email associated with the user                                | <span class="badge badge--danger">NO</span>   |
| `roles`       | `array of strings` | Roles associated with the user                                | <span class="badge badge--danger">NO</span>   |
| `aud`         | `array of strings` | List of audiences for which is the token intended             | <span class="badge badge--danger">NO</span>   |

The JWT consists of three parts - JOSE Header describing the cryptographic operations applied to the JWT, JWT Claims Set and signature. Each of these parts is Base64Url encoded, and the parts are sent separated by ".". This is the format in which the token is sent by the issuer. More about JWTs can be found [RFC Standard 7519](https://datatracker.ietf.org/doc/html/rfc7519).

The encoded JWT is provided in "Authorization" header, with value in format "Bearer encodedTokenValue".
An example of the user identity provided as JWT:

```json
JOSE Header:
 {
  "typ":"JWT",
  "alg":"HS256"
  }
JWT Claims:
{
  "sub": "2d73cf2a-5339-421e-81cd-8fa0d25a100b",
  "iss": "htttp://example.com",
  "username": "test",
  "roles": [
    "test-role",
    "new-role"
  ],
  "given_name": "Test",
  "family_name": "Test",
  "email": "test@test.com",
  "aud": ["audience"]
}
Signature:
dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk

# Header
"Authorization"="Bearer eyJ0eXAiOiJKV1QiLA0KICJhbGciOiJIUzI1NiJ9eyJpc3MiOiJqb2UiLA0KICJleHAiOjEzMDA4MTkzODAsDQogImh0dHA6Ly9leGFcGxlLmNvbS9pc19yb290Ijp0cnVlfQ.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
```

:::warning
External authentication servers is responsible to provide consistent JWT that is used for identification of the user. [Keycloak](https://www.keycloak.org/) is one of the tested authentication servers.
:::

## Delegation tokens

An integrated system can present an access token with the [RFC 8693 actor claim](https://www.rfc-editor.org/rfc/rfc8693.html#section-4.1), `act`, to make a request on behalf of a user. The top-level `sub` identifies that user; the usual username claim and roles still identify and authorize the user in the platform. The delegate identified inside `act` is not a platform user and receives no platform role or permission. Ownership, certificate history, and the event history of other objects continue to name the user.

The external identity provider issues the token and performs any token exchange. Core only validates the resulting access token. It selects the OAuth 2.0 provider by the token's issuer and applies the existing issuer, signature, audience, and time validation, including clock skew. It then checks the delegate against that provider's [allowed delegates](../../../settings/authentication.md#allowed-delegates). The delegate comes only from the signature-validated access token, never from User Info claims.

For example, the following decoded claims identify `jane.admin` as the user and `automation-client` as the delegate. This is an illustrative payload, not a usable token:

```json
{
  "iss": "https://identity.example.com/realms/platform",
  "sub": "user-subject-id",
  "username": "jane.admin",
  "aud": ["ilm"],
  "act": {
    "client_id": "automation-client",
    "sub": "delegate-service-account-id"
  }
}
```

With the default delegate claim, `client_id`, the provider must allow exactly `automation-client`. Authentication fails with HTTP `401` if the allowlist is empty, the delegate is not allowed, `act` is not an object, or the selected claim inside `act` is missing, blank, or not a string. Only the immediate delegate, the outermost `act`, is checked and [recorded in the audit log](../../../logging/log-record-structure.md#delegate). Nested `act` objects are accepted but are not checked or recorded.

These rules apply to OAuth 2.0 bearer authentication on the API and the [timestamping endpoint](../../../../signing/timestamping/authentication-authorization.md#delegation-tokens). A token without `act`, interactive OIDC sign-in, client certificates, and other authentication methods keep their existing behavior. Delegation tokens are not supported by the MCP server.
## Identification order

When identifying user, the following order is applied:

1. X.509 certificate
2. JWT

When none of the identification data of user is provided, user is considered to be **anonymous** (unidentified).
