---
sidebar_position: 2
---

# Authority Provider v3

## Overview

Authority Provider v3 is the current interface between the `Core` and a certification authority. Like the [v2 interface](./authority-provider-v2.md) it covers certificate **issue**, **renew**, **rekey**, and **revoke**, and adds **pre-registration** — registering an identity with the CA before a CSR exists. It differs from v2 in three ways:

- **Stateless.** There is no authority-instance lifecycle (`createAuthorityInstance` and friends are gone). The authority identity travels in every request.
- **Capability-driven.** Optional behavior (pre-registration, status polling, structured requests, identity override, renewal information) is advertised per connector and enforced by the platform.
- **Synchronous or asynchronous.** Any operation may complete immediately or be accepted for later completion, which the platform polls to a terminal state.

The v3 certificate states and transitions (`Pending Registration`, `Registered`, the async `Pending Issue` / `Pending Revoke` states, and their restore paths) are documented on the [Certificate state](../../concept-design/core-components/certificate.md#certificate-state) page; this page describes the connector interface itself and does not repeat the state diagram.

## Relationship to Legacy and v2

The `interfaces` repository carries three generations of the authority-provider contract. The platform picks the implementation from the interface version the connector reports for its authority:

| Generation | Wire | Authority identity | Certificate operations |
|------------|------|--------------------|------------------------|
| [Legacy](./authority-provider-legacy.md) | `/v1/…` | Stateful authority instance | Issue, renew, revoke |
| [v2](./authority-provider-v2.md) | `/v2/…` (instance mgmt at `/v1/…`) | Stateful authority instance | Issue, renew, revoke, plus async parking of parked operations |
| **v3** | `/v3/…` | **Stateless** — attributes in each request | Issue, renew, rekey, revoke, **register**, identify — synchronous or asynchronous |

A connector that reports interface version `v2` is served by the stateful adapter; one that reports `v3` is served by the stateless adapter. A legacy connector uses the separate legacy path. The stateless and stateful models are otherwise independent — a v3 authority has no authority-instance object at all.

## How it works

### Stateless model

v3 has **no authority-instance lifecycle**. There is no create, read, update, or delete of an authority instance on the connector — the operations a v3 connector exposes at the authority level are only:

- `listAuthorityAttributes` — the attribute schema shown when an operator sets up an authority.
- `checkAuthorityConnection` — validate the supplied authority attributes by reaching the CA (a `204` means reachable).
- `listRaProfileAttributes` — the RA-profile attribute schema, given authority context.
- `getCrl`, `getCaCertificates` — fetch a CRL (full or delta) and the CA chain.

Because nothing is stored connector-side, **every** certificate request carries the full context the connector needs to reconstruct the upstream-CA session: two attribute lists, `authorityAttributes` and `raProfileAttributes`. The platform assembles them from the authority and RA-profile configuration on each call (dereferencing any secret or credential references as the system identity) and the connector rebuilds its CA session per request. There is no session or instance handle to keep in sync.

### Capabilities (feature flags)

Optional v3 behavior is gated by capabilities a connector advertises in its interface `features`. These flags are **opt-in and enforced**: if a connector does not advertise a capability, the platform treats it as unsupported and never invokes it.

| Capability | Code | What it enables |
|------------|------|-----------------|
| Certificate registration | `certificateRegistration` | Pre-register an identity with the CA before a CSR exists (the `/register` endpoints). |
| Certificate status polling | `certificateStatusPolling` | The connector can be polled for asynchronous completion. Without it, the platform will not poll even if the connector accepts an operation with `202`. |
| Structured certificate request | `certificateRequestStructured` | The connector accepts the structured request-content model on register / issue / renew. |
| Certificate identity override | `certificateIdentityOverride` | The connector applies a platform-supplied identity to a forwarded CSR (e.g. an End Entity override) instead of stripping and re-signing it. |
| Certificate renewal information | `certificateRenewalInfo` | The connector reports the renewal window the CA suggests for issued certificates (the `/renewalInfo` endpoint). See [Renewal information](#renewal-information). |

The platform enforces capabilities in depth: the operation is only attempted when the adapter supports it, the authority advertises the flag, and — as a final backstop — the connector may still answer `OPERATION_NOT_SUPPORTED` at runtime.

## Certificate operations

All v3 certificate operations are `POST` requests under `/v3/authorityProvider/certificates`, each carrying `authorityAttributes` + `raProfileAttributes` alongside the operation payload.

| Operation | Path | Purpose |
|-----------|------|---------|
| List request attributes | `/request/attributes` | Optional. Schema of the certificate request identity (subject, SANs, extensions). |
| List issue attributes | `/issue/attributes` | Dynamic attribute schema for issuance. |
| Issue | `/issue` | Issue a certificate from a CSR. |
| List renew attributes | `/renew/attributes` | Optional. Dynamic attribute schema for renewal and rekey. |
| Renew / rekey | `/renew` | Renew or rekey. Status and cancel reuse the `issue` endpoints. |
| List revoke attributes | `/revoke/attributes` | Dynamic attribute schema for revocation. |
| Revoke | `/revoke` | Revoke a certificate. |
| List register attributes | `/register/attributes` | Dynamic attribute schema for registration. |
| Register | `/register` | Pre-register an identity (no CSR). |
| List identify attributes | `/identify/attributes` | Optional. Dynamic attribute schema for identifying a certificate. |
| Identify | `/identify` | Identify an uploaded certificate at the CA. |
| Status | `/issue/status`, `/revoke/status`, `/register/status` | Poll a parked operation. |
| Cancel | `/issue/cancel`, `/revoke/cancel`, `/register/cancel` | Cancel an in-flight operation. |
| Renewal information | `/renewalInfo` | Optional, with `certificateRenewalInfo`. Renewal windows suggested by the CA for a batch of issued certificates. |

Renew and rekey do not have their own status or cancel endpoints — they reuse the `issue` ones.

Unlike v2, v3 has **no connector-side attribute validation** round-trip. The platform validates request attributes structurally against the schema returned by the `…/attributes` endpoints; the connector is not asked to re-validate.

### Optional attribute schemas

The `/request/attributes`, `/renew/attributes` and `/identify/attributes` endpoints are optional. They are not advertised with a capability flag: a connector offers a schema by serving the endpoint. They take the same request as the other attribute-list endpoints and return an array of attribute definitions.

- `/request/attributes` lists the request attributes the connector offers for the certificate request identity. The platform combines them with the request attributes of the `RA Profile` according to its [merge mode](../../concept-design/core-components/request-attribute.md#merge-mode), which also describes what applies when the connector offers none.
- `/renew/attributes` lists the attributes asked for when a certificate is renewed or rekeyed.
- `/identify/attributes` lists the attributes asked for when a certificate is identified at the CA, for example when it is uploaded or assigned to an `RA Profile`.

A connector that does not offer a schema answers `404`, `501` with the error `OPERATION_NOT_SUPPORTED`, or an empty array, and the platform treats each of them as "no schema". Any other error fails the operation. Without a renew or identify schema, the operation takes no attributes: no attribute form is shown, and attribute values supplied for the operation are rejected.

## Synchronous and asynchronous operations

A v3 connector may complete an operation immediately or accept it for later completion. The signal is the HTTP status on the operation call:

| Operation | Synchronous | Asynchronous |
|-----------|-------------|--------------|
| Issue / renew / register | `200 OK` with the result in the body | `202 Accepted` |
| Revoke | `204 No Content` (or `200 OK` with metadata only) | `202 Accepted` |

When a connector accepts an operation asynchronously, it returns a connector-owned **`meta`** tracking handle in the body. `meta` is a single opaque bag — the platform never interprets it; it stores it against the certificate and replays it verbatim on every subsequent status, cancel, or register-bound issue call. The connector decides what to put in it (an order ID, a transaction reference, multi-field state).

The platform then resolves the operation by **polling** the matching `…/status` endpoint, provided the authority advertises `certificateStatusPolling`. If it does not, the platform does not poll and the operation is completed out-of-band. (The pending certificate states the platform tracks meanwhile are described on the [Certificate state](../../concept-design/core-components/certificate.md#certificate-state) page.)

### Polling

```plantuml
@startuml
autonumber
Core -> Connector : POST /v3/authorityProvider/certificates/issue/status (meta)
Connector -> CA : Check status
alt Still processing
  Connector --> Core : status = inProgress
else Completed
  Connector --> Core : status = completed (+ certificateData for issue/renew)
else Failed
  Connector --> Core : status = failed (+ reason)
end
@enduml
```

The status response reports one of `inProgress`, `completed`, or `failed`. For a completed issue or renew it carries the Base64 certificate; for a completed revoke no payload is needed. A failed status carries a curated `reason` that the platform surfaces to the operator. An `inProgress` result resets the attempt counter, so a genuinely slow CA never times out on the platform side.

### Issue (synchronous or asynchronous)

```plantuml
@startuml
autonumber
Core -> Connector : POST /v3/authorityProvider/certificates/issue\n(authorityAttributes, raProfileAttributes, CSR)
Connector -> CA : Submit issue request
alt Synchronous
  CA --> Connector : Certificate
  Connector --> Core : 200 OK (certificateData, meta)
else Asynchronous
  CA --> Connector : Accepted (no certificate yet)
  Connector --> Core : 202 Accepted (meta)
end
@enduml
```

### Cancel

A cancel targets an in-flight operation. The connector returns one of three outcomes:

- **Aborted** (`204`) — the connector aborted the operation.
- **Not tracked** (`404` with [`OPERATION_NOT_TRACKED`](/problems/connector/OPERATION_NOT_TRACKED), or `422` with [`REGISTRATION_NOT_FOUND`](/problems/connector/authority/REGISTRATION_NOT_FOUND)) — the connector does not (or no longer) track the operation: already finalized externally, or a stateless implementation.
- **Refused** (`422` with [`OPERATION_PAST_POINT_OF_NO_RETURN`](/problems/connector/OPERATION_PAST_POINT_OF_NO_RETURN)) — the CA cannot abort the operation.

The connector reports the outcome; the platform decides the resulting certificate state.

## Certificate registration (pre-registration)

When an authority advertises `certificateRegistration`, the connector supports **pre-registration** — registering an identity with the CA before any CSR exists. The connector exposes two endpoints for it:

- `/register/attributes` — the attribute schema for registration.
- `/register` — register an identity. The request carries the registration identity (the subject and, when `certificateRequestStructured` is advertised, the structured request content) but **no CSR**. Like issue, it completes synchronously (`200`) or asynchronously (`202` with a `meta` handle, resolved through `/register/status` and `/register/cancel`).

Registration returns no certificate — it establishes the identity at the CA. When the certificate is later issued, the connector receives an ordinary `/issue` call that **replays the registration's `meta` handle**, so it can link the issuance to the earlier registration. Accepting that replayed handle is the connector's only obligation at completion; how the platform drives completion (attaching the CSR, verifying any challenge) is on the [Certificate state](../../concept-design/core-components/certificate.md#registration-lifecycle) page.

```plantuml
@startuml
autonumber
Core -> Connector : POST /v3/authorityProvider/certificates/register\n(identity, no CSR)
Connector -> CA : Register identity
alt Synchronous
  CA --> Connector : Registered
  Connector --> Core : 200 OK (meta)
else Asynchronous
  CA --> Connector : Accepted
  Connector --> Core : 202 Accepted (meta)
  note over Core, Connector : Core polls /register/status until completed
end
@enduml
```

Two aspects of registration are handled entirely by the platform and do not involve the connector:

- **Platform-level pre-registration** — when an authority does not advertise `certificateRegistration`, the platform registers the identity itself, with no `/register` call.
- **Authorization secret (challenge)** — an operator may protect a registration with a secret that must be presented again to complete the issuance. It is a control between the operator and the platform; no connector request or response carries it.

Both, along with the certificate states through registration and completion, are described on the [Certificate state](../../concept-design/core-components/certificate.md#registration-lifecycle) page.

## Renewal information

When an authority advertises `certificateRenewalInfo`, Core asks the connector for the renewal window the CA suggests for its issued certificates, for example from the ACME Renewal Information ([RFC 9773](https://datatracker.ietf.org/doc/html/rfc9773)) of an ACME CA. The window means "the CA advises renewing inside this window"; a window that starts in the past means renew now. Core stores it as the [renewal window](../../concept-design/core-components/renewal-window.md) of the certificate with the source `authority`.

Only the refresh job of Core calls the endpoint, for the certificates of `RA Profiles` that use the renewal window from the certificate authority, as described in [Renewal information from the certificate authority](../../concept-design/core-components/renewal-window.md#renewal-information-from-the-certificate-authority). No user request and no ACME request reaches it.

### Request

`POST /v3/authorityProvider/certificates/renewalInfo` carries `authorityAttributes` and `raProfileAttributes`, like the other certificate operations, and a batch of certificates of one `RA Profile`:

| Field | Required | Description |
|---|---|---|
| `certificates` | Yes | 1 to 50 items; Core sends at most the **Refresh Batch Size** platform setting |
| `certificates[].reference` | Yes | An opaque identifier, unique within the request, that the connector returns with the result |
| `certificates[].certificate` | Yes | The certificate, Base64-encoded DER |
| `certificates[].meta` | No | The metadata the connector stored for the certificate |

A blank field, a repeated reference or a batch outside the limits above is invalid and answered with `422`.

### Response

The connector answers `200` with one result per item, in any order, whatever the outcome of each item:

| Field | Description |
|---|---|
| `retryAfter` | Optional. Seconds until the next refresh for every result without its own |
| `results[].reference` | The reference of the item |
| `results[].status` | `available`, `unknown`, `notSupported` or `retry` |
| `results[].windowStart`, `results[].windowEnd` | The suggested window; required for `available`, and the end must be after the start |
| `results[].explanationUrl` | Optional. A page that explains the window. Core keeps it only when it is an absolute `http` or `https` URL of at most 2048 characters, and drops it otherwise |
| `results[].retryAfter` | Optional. Seconds until the next refresh of this certificate |
| `results[].reason` | Optional. A short text for the operator, without certificate content |

Core handles the statuses as follows:

| Status | Meaning | Core |
|---|---|---|
| `available` | The CA suggests a window | Stores the window and refreshes it after the retry-after time |
| `unknown` | The CA does not know the certificate | Removes a window that came from the CA and asks again only after the **Refresh Re-check Interval** |
| `notSupported` | The CA gives no advice for the certificate | As `unknown` |
| `retry` | Temporary failure, or the connector did not reach the item in time | Asks again after the retry-after time, or after a growing delay when none is given |

An item missing from `results`, a repeated reference, or an `available` result without a valid window is treated as `retry`.

### Retry-after rules

The next refresh of a certificate comes after the item's `retryAfter`, else the response's `retryAfter`, else the **Refresh Default Interval**. The delay is kept between the **Refresh Minimum Interval** and the **Refresh Maximum Interval** and varied by up to 10 %. These are [platform settings](../../settings/platform.md#renewal-information). Without any retry-after time, a `retry` result is asked again after a growing delay, see [Renewal information from the certificate authority](../../concept-design/core-components/renewal-window.md#renewal-information-from-the-certificate-authority).

Errors of the whole call:

| Answer | Core |
|---|---|
| `422`, `429`, `503`, another error, a timeout or an unreadable response | Logs the error and asks about the batch again after the growing delay |
| `404`, `501` or the error `OPERATION_NOT_SUPPORTED`, although the flag is advertised | Logs a warning and asks about the batch again only after the **Refresh Re-check Interval** |

The connector paces its calls to the CA itself. It should answer within 20 seconds, and answer `retry` for the items it did not reach in that time rather than fail the request.

## Errors

The connector answers errors as `application/problem+json`, following [Error Handling](../error-handling.md). These codes are specific to this interface:

| Code | Status | Operations | Answered when |
|------|--------|------------|---------------|
| [`CSR_MALFORMED`](/problems/connector/authority/CSR_MALFORMED) | `422` | Issue, renew | The CSR cannot be parsed |
| [`CSR_SUBJECT_MISMATCH`](/problems/connector/authority/CSR_SUBJECT_MISMATCH) | `422` | Issue against a registration | The subject of the CSR differs from the registered identity |
| [`REGISTRATION_NOT_FOUND`](/problems/connector/authority/REGISTRATION_NOT_FOUND) | `422` | Any call that replays a registration's `meta` | The CA no longer tracks the registration |
| [`RENEWAL_SOURCE_NOT_FOUND`](/problems/connector/authority/RENEWAL_SOURCE_NOT_FOUND) | `404` | Renew | The CA has no record of the certificate being renewed |
| [`REVOCATION_NOT_ALLOWED`](/problems/connector/authority/REVOCATION_NOT_ALLOWED) | `422` | Revoke | The CA refuses the revocation |
| [`CERTIFICATE_MISMATCH`](/problems/connector/authority/CERTIFICATE_MISMATCH) | `422` | Revoke, identify | The certificate belongs to a different authority |

## For connector developers

A v3 connector reconstructs the CA session from `authorityAttributes` + `raProfileAttributes` on every call. The **base contract** it must implement is the attribute-list endpoints (`/issue/attributes`, `/revoke/attributes`), `issue`, `renew`, `revoke`, `identify`, and the authority-level `listAuthorityAttributes`, `checkAuthorityConnection`, `listRaProfileAttributes`, `getCrl`, `getCaCertificates`.

**Optional by endpoint** — `/request/attributes`, `/renew/attributes` and `/identify/attributes`; see [Optional attribute schemas](#optional-attribute-schemas).

**Optional, capability-advertised** behavior (only used when the corresponding flag is advertised):

- `certificateRegistration` → implement `/register` and `/register/attributes` (and, if registration can be asynchronous, `/register/status` and `/register/cancel`).
- `certificateStatusPolling` → implement the `…/status` and `…/cancel` endpoints and honor `202`. Without advertising it, returning `202` will leave the certificate parked with no polling.
- `certificateRequestStructured` / `certificateIdentityOverride` → accept the structured request-content model and apply a platform-supplied identity to a forwarded CSR.
- `certificateRenewalInfo` → implement `/renewalInfo`; see [Renewal information](#renewal-information). In the Go SDK, implement the optional `RenewalInfoProvider` interface and register it with `WithRenewalInfo`: the route is served only then, and the handler checks the size of the batch, the references and the windows. A connector that advertises `certificateRenewalInfo` requires Core 2.21 or later.

**Signalling async:** return `202` with a connector-owned `meta` tracking handle in the body. The platform replays that `meta` on every subsequent status, cancel, and register-bound issue call, and reports completion through the status endpoint as `inProgress` / `completed` / `failed`.

## Specification

Authority Provider v3 implements the [Common Interfaces](../common-interfaces/overview.md) plus the v3 Authority Management and Certificate Management interfaces.

The OpenAPI specification of the Authority Provider v3 is published in the platform API reference: [Connector API - Authority Provider v3](/api/connector-authority-provider-v3).
