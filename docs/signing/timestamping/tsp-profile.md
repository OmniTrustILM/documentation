---
sidebar_position: 3
---

# TSP Profile

A `TSP Profile` is the front gate to the Timestamping engine for RFC 3161 clients — it decides who is allowed in and what happens once they are.

Each `TSP Profile` configures two things:

- **Authentication** — which methods clients may use to prove their identity: a client certificate, a bearer token, or a username and password.
- **Default `Signing Profile`** — the signing configuration that processes the request when the client does not name one explicitly. This determines which key is used, which TSA policy applies, and what goes into the timestamp token.

To understand how a `TSP Profile` links to a `Signing Profile` — whether you are configuring from the `TSP Profile` side or the `Signing Profile` side — refer to the [`Signing Profile` page](/docs/signing/signing-profile).

---

## How clients reach the timestamping engine

An RFC 3161 client can reach the engine through one of two routes:

**TSP Profile route** — the client addresses the `TSP Profile` by name and the platform resolves the request to its default `Signing Profile`:

```
POST /v1/protocols/tsp/{tspProfileName}
```

This requires the `TSP Profile` to have a default `Signing Profile` set.

**Signing Profile route** — the client addresses the `Signing Profile` directly:

```
POST /v1/protocols/tsp/signingProfiles/{signingProfileName}
```

:::warning[Activation required from the Signing Profile]
The Signing Profile route only works when the `TSP Profile` is activated from the `Signing Profile` side — using the **Protocols** tab on the `Signing Profile` detail page. Setting a `Signing Profile` as the default on a `TSP Profile` is not enough; that only enables the TSP Profile route. See [Linking to a TSP Profile](./configuration.md#linking-to-a-tsp-profile) for the activation steps.
:::

Use the Signing Profile route when clients should target a specific `Signing Profile` explicitly; use the TSP Profile route when clients should resolve to whichever `Signing Profile` is set as the default.

---

## Default Signing Profile

The default `Signing Profile` is optional. Without it, timestamp requests cannot go through the TSP Profile route and must use the Signing Profile route instead, which requires the `TSP Profile` to be activated on the `Signing Profile` first.

---

## Vault Profile

A `Vault Profile` is required when the `TSP Profile` uses **Basic Authentication** — it is the backend used to securely store the credentials. Profiles that use only **Client Certificate** or **Bearer Token** do not need one. See [Authentication methods](#authentication-methods) below for details on each method.

The credentials themselves are created after the `TSP Profile` is saved, on the `TSP Profile` detail page.

---

## Authentication methods

When creating or editing a `TSP Profile`, you choose which authentication methods clients are allowed to use. At least one must be selected.

| Method | Transport | Credential |
|---|---|---|
| **Client Certificate** | Mutual TLS; the client certificate arrives in the configured client certificate header | X.509 certificate |
| **Bearer Token** | `Authorization: Bearer` header | JWT |
| **Basic Authentication** | `Authorization: Basic` header | Username and password |

:::note
When a timestamp request fails authentication, the platform returns an HTTP `401` response. This is not an in-band TSP response — the client will not receive a `TimeStampResp` with a failure status.
:::

### Basic Authentication

When **Basic Authentication** is enabled, you manage credentials directly on the `TSP Profile` detail. The **Basic credentials** section lists all configured credentials and lets you add new ones. Each credential maps an existing platform user to a username and password of your choice.

When a request arrives, the platform looks up the username from the `Authorization: Basic` header, verifies the password, and assigns the permissions of the timestamp client user to the request. If the password does not match or the username is not found, the request is refused.

### Bearer Token

No user mapping is configured on the `TSP Profile` for **Bearer Token** authentication. When a request arrives with an `Authorization: Bearer` header, the platform decodes the JWT and resolves the platform user from its claims. The trust relationship is between the platform and the identity provider that signed the token. As long as the identity provider is trusted by the platform and a matching user exists in the platform, authentication succeeds without any additional configuration on the `TSP Profile`.

### Client Certificate

An the platform user can have a client certificate associated with their account. When **Client Certificate** authentication is enabled, that certificate can be used to authenticate timestamp requests directly — no additional mapping is needed on the `TSP Profile` beyond enabling the method.

For a full description of how methods are prioritised, how authorization works, and how the 401 challenge is formed, see [Authentication and Authorization](./authentication-authorization.md).

---

## Relationships summary

- A TSP Profile references at most one **Signing Profile** as its default. Multiple Signing Profiles may associate with the same TSP Profile.
- A TSP Profile references at most one **Vault Profile** for secret storage.
- A TSP Profile owns zero or more basic-credential records (cascade delete: credentials are removed when the TSP Profile is deleted).

See the [relationship diagram on the Signing Profile page](/docs/signing/signing-profile#relationships) for how these objects connect.

---

## Related pages

- [Signing Profile](/docs/signing/signing-profile) — the profile a TSP endpoint resolves to
- [Authentication and Authorization](./authentication-authorization.md) — credential types, allowed-method enforcement, identity mapping
- [Timestamping request flow](./timestamping-flow.md) — where the TSP Profile sits in the request path

The OpenAPI specification for managing `TSP Profiles` can be found here: [Core API - TSP Profile](/api/core-tsp-profile).
