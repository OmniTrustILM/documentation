---
sidebar_position: 5
---

# Identification

Each user is identified by one of the supported methods listed below:

- X.509 certificate
- JWT

Identification is performed by the [CZERTAINLY Auth Service](https://github.com/CZERTAINLY/CZERTAINLY-Auth).

## X.509 certificate

User can be identified based on X.509 certificate representing the digital identity.
Typically, the X.509 certificate of authenticated user is provided as Base64-encoded value in the header.

An example of the user identity provided as X.509 certificate:

```
ssl-client-cert=MIIE/TCCAuWgAwIBAgIUPCqjU2t+JmCd9j/47eIc8DnaBJ0wDQYJKoZIhvcNAQENBQAwOzEbMBkGA1UEAwwSRGVtbyBTZXJ2ZXIgU3ViIENBMRwwGgYDVQQKDBMzS2V5IENvbXBhbnkgcy5yLm8uMB4XDTIyMTAxMjA5MTg0M1oXDTIyMTAxMjIxMTg0MlowDjEMMAoGA1UEAwwDeDExMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAx3yEn1ivUp4etk3kdNrRXNP5PeIpTYobGj4lQrW57rsj9hhOhY/SwaeCu6sYPVvYIXPWnlc4tTafjcen/8Ikc7pY2NuzD0HaIAOujblcMKT2KAKA/OU+RrI2o/swU9UmEQ2wYveNYCGobimt/foURrB9opeDCx3pFXkddYsXAziaWu3AQIF5gIf/b+r7hYRIXh8V/u01t6FCnpBWCtdmYVrJ5e8KZw0yqptNpgDK1plu+8AR5tviP/vgrpBquwzNsVREsnRZJxOM6rXq9rG5scoqO+gxdsm6+EqfRiGiBvcaIr+Zpv81ryfiABLdixvyhoZ//3o8rAU0O7Pjm7HTxwIDAQABo4IBJDCCASAwDAYDVR0TAQH/BAIwADAfBgNVHSMEGDAWgBQb/FXk1AOCzd40P27IA82xTCrutTBQBggrBgEFBQcBAQREMEIwQAYIKwYBBQUHMAKGNGh0dHA6Ly9wa2kuM2tleS5jb21wYW55L2Nhcy9kZW1vL2RlbW9zZXJ2ZXJzdWJjYS5jcnQwEQYDVR0gBAowCDAGBgRVHSAAMBMGA1UdJQQMMAoGCCsGAQUFBwMBMEYGA1UdHwQ/MD0wO6A5oDeGNWh0dHA6Ly9wa2kuM2tleS5jb21wYW55L2NybHMvZGVtby9kZW1vc2VydmVyc3ViY2EuY3JsMB0GA1UdDgQWBBQzGoVZucmxb0IrrAWE2oPxrcEOojAOBgNVHQ8BAf8EBAMCBaAwDQYJKoZIhvcNAQENBQADggIBAN+hsAdianf+76orB/KwNDLIE36XOai6Z5/9VHmgWKHmVqdBYf8RU/Pdd8NcCULIy8bDI67H7BhPbciRcFfHn7rkWNNz1LCvnxxEzfj20A0WGuPC4oQTnU7QpPJr6tru7d6rLsbJPCRYBhEw6soLRzmWWAy5P+RoONWJCw6fv+2o8xwsX7jGYkwYmmdu4sr8+f5hREyfLXt6z4CZCue1/gcOrS+fKzaXLAJ/2pVCqcKIKn+oUW8LtnB2R8jJe08KbXZwnlTTmaTCMT/k5tAWE34VnpCaMJPRR7gMeOTSiV73kfLpKGnSTFLaZr05hvaMBUzP1nZSmZOyMOFrZSZSH+tE8zK098UhXiNTKSFywbN5HfNV+YLMuG9sMU25xBB4pvx/iXcH3e3o6JmFBTjJeKVCgljhWgPalb52kA1YdN9sE0DLBBX+UVjT0W7+JkKOvEwo3VqLUZqavwfkfjHEx3Dlzx0Q4m8N2XCGkHe1tRz1McKbn2RCJk3sgZoe9fANK68L+d4CM3A31qbjgYkhJ0geDSS797CEpD8UK3NWYx/ssad45SU20Axq3BkSTpjS9eG1QPwR1YX0CywyTwbceNw6PvWNC28VLjverXi9beT1dbZ7HKHNap768cT5TTGViWEBFnuueIVNsBGSDNV3Qtba94HGKHuGNJpYvkMas4JZ
```

:::warning
The user must exist and must be associated with the X.509 certificate to be successfully identified and authenticated.
:::

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
