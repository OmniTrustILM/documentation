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

## Identification order

When identifying user, the following order is applied:

1. X.509 certificate
2. JWT

When none of the identification data of user is provided, user is considered to be **anonymous** (unidentified).
