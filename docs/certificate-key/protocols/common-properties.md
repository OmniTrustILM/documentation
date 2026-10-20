---
sidebar_position: 1
---

# Common Protocol Properties

All supported protocol profiles share a set of common properties that behave consistently across all protocols.

## Default RA Profile

A default **RA Profile** can be assigned to each protocol profile.  
When a default **RA Profile** is selected, the corresponding **Attributes** for certificate issuance and revocation must also be configured, if required.

:::warning
Certificate management **Attributes** defined in a **Protocol Profile** are used during certificate operations and **cannot be modified** by the protocol client.
:::

## Default Certificate Associations

Default certificate associations can be configured within a protocol profile to define how ownership and access are assigned to certificates issued through the protocol.

These associations may include:
- **Owner** — The entity that owns the issued certificates.
- **Group** — The group under which the certificates are managed.
- **Custom attributes** — Additional metadata or policies applied to issued certificates.

Default associations can be set during **profile creation** or modified later when **editing** the protocol profile.

## Challenge source

SCEP and CMP profiles have a **Challenge Source** that decides how a client is authenticated when it enrolls:

- **Protocol Default** — the authentication configured on the profile applies.
- **Certificate Registration** — the client enrolls against a certificate that was [registered](../quick-start/certificate-management/register-certificate.mdx) beforehand, and authenticates with the challenge of that registration. The profile has no secret of its own.

How a request is matched to a registration is described on the [SCEP Profile](scep/scep-profile.md#challenge-source) and [CMP Profile](cmp/cmp-profile.md#challenge-source) pages. A request that does not match, or whose challenge is wrong, is refused with a generic error that does not say which check failed. The reason is in the platform log and, when a registration was identified, in the event history of its certificate. A wrong challenge counts as a failed attempt toward [locking the registration](../concept-design/core-components/certificate.md#authorization-secret-challenge).

## Request attribute validation

When a client enrolls with a CSR over a protocol, the platform validates the CSR against the [resolved request-attribute set](../concept-design/core-components/ra-profile.md#request-attributes) of the `RA Profile` that serves the request. What is checked, and what the strict and lenient modes mean, is described in [External CSR validation](../concept-design/core-components/ra-profile.md#external-csr-validation). The platform never rewrites the request. It either accepts or rejects it.

Under strict mode, a rejected extension is reported by its dotted OID only. One recognisable case: very old clients emitting a deprecated X.509 v1/v2 extension OID from the `2.5.29.1`–`2.5.29.8` or `2.5.29.10`–`2.5.29.13` range — rejected like any unmapped extension.

In lenient mode, violations are logged as warnings and the CSR is accepted. In strict mode, each protocol rejects a non-compliant CSR with its own native error:

| Protocol | Validated operation                       | Rejection error               |
|----------|-------------------------------------------|-------------------------------|
| ACME     | finalize                                  | problem type `badCSR`         |
| CMP      | `ir`, `cr`                                | failInfo `badCertTemplate`    |
| SCEP     | PKCSReq                                   | failInfo `badRequest`         |
| REST API | certificate issuance with an uploaded CSR | HTTP 422                      |

When the resolved set cannot be computed — for example, the `Authority`'s connector is unavailable — a strict profile fails the request as a server error, not as a policy violation. A lenient profile skips validation.
