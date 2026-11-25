---
sidebar_position: 3
---

# ACME Profile

`ACME Profile` specifies the configurations of the ACME server behaviour. `ACME Account` that is registered to the `ACME Profile` follows the behaviour.
 It holds the configuration listed below:

| Configuration                                       | Purpose                                                                            | Default Value        | Mandatory                                     |
|-----------------------------------------------------|------------------------------------------------------------------------------------|----------------------|-----------------------------------------------|
| **Name**                                            | `ACME Profile` Name                                                                |                      | <span class="badge badge--success">Yes</span> |
| **Description**                                     | Description of the `ACME Profile`                                                  | `None`               | <span class="badge badge--danger">No</span>   |
| **Terms of Service URL**                            | URL for the Terms of Service the client has to agree                               | `None`               | <span class="badge badge--danger">No</span>   |
| **Website URL**                                     | Website URL containing additional information                                      | `None`               | <span class="badge badge--danger">No</span>   |
| **DNS Resolver IP**                                 | IP of the DNS resolver if a custom DNS is used                                     | `System default DNS` | <span class="badge badge--danger">No</span>   |
| **DNS Resolver Port**                               | Port of the DNS resolver                                                           | `53`                 | <span class="badge badge--danger">No</span>   |
| **Retry Interval**                                  | Retry interval in seconds to be set in the `Retry-After` header                    | `30`                 | <span class="badge badge--danger">No</span>   |
| **Order Validity**                                  | Order validity in seconds                                                          | `10 Hours`           | <span class="badge badge--danger">No</span>   |
| **Disable new Orders (Change in Terms of Service)** | Disable new Order requests until the new Terms of Service are agreed               | `false`              | <span class="badge badge--danger">No</span>   |
| **Changes in Terms of Service URL**                 | New Terms of Service URL that will be set if the Disable new Order is configured   | `None`               | <span class="badge badge--danger">No</span>   |
| **Require Contacts for new Accounts**               | Specifies whether the contacts are required for registering a new account          | `false`              | <span class="badge badge--danger">No</span>   |
| **Require agree to Terms of Service**               | Specifies whether the Terms of Service must be agreed for new account registration | `false`              | <span class="badge badge--danger">No</span>   |
| **External Account Binding secrets**                | Secrets holding the keys that new accounts must bind with. See [External Account Binding](external-account-binding.md) | none (anyone may register) | <span class="badge badge--danger">No</span>   |
| **Pre-authorized identifiers**                      | Identifiers that accounts may obtain without proving control of them, and whether an identifier the list does not cover needs a challenge (the default) or is refused. See [Pre-authorized identifiers](#pre-authorized-identifiers) | none                 | <span class="badge badge--danger">No</span>   |
| **Enable renewal information**                      | Serve [renewal information](#renewal-information) to ACME clients and accept `replaces` in new orders | `false` | <span class="badge badge--danger">No</span>   |
| **Renewal information retry-after**                 | Seconds clients wait before asking for renewal information again, from 300 to 86400 | `21600` (6 hours) | <span class="badge badge--danger">No</span>   |

By default `ACME Profiles` will be created without any default `RA Profile`, if not selected any.

:::note
Updating an `ACME Profile` through the API replaces its configuration, except for `renewalInfoEnabled` and `renewalInfoRetryAfter`: a request that leaves out either field, or sends it as `null`, keeps its current value. Creating a profile without them applies the defaults.
:::

## Renewal information

An `ACME Profile` can serve ACME Renewal Information ([RFC 9773](https://datatracker.ietf.org/doc/html/rfc9773)): ACME clients that support it ask the platform when to renew each certificate, instead of renewing at a fixed share of its lifetime. The platform answers with the [renewal window](../../concept-design/core-components/renewal-window.md) of the certificate, whichever source set it. A certificate without a window gets no renewal information, so turn on a source of windows as well, in the [renewal settings](../../concept-design/core-components/ra-profile.md#renewal-settings) of the `RA Profile`, or request [early renewal](../../concept-design/core-components/ra-profile.md#early-renewal).

Renewal information is off by default. When **Enable renewal information** is on, the directory of the profile carries the `renewalInfo` URL, in both ACME APIs:

- `https://<hostname>:<port>/api/v1/protocols/acme/{acmeProfileName}/renewal-info`
- `https://<hostname>:<port>/api/v1/protocols/acme/raProfile/{raProfileName}/renewal-info`

A client asks for the renewal information of a certificate with `GET <renewalInfo>/{certID}`, where the certificate identifier is built from its authority key identifier and serial number as RFC 9773 describes. The request needs no account and no nonce, and the platform answers from its database without calling the CA:

| Answer | When |
|---|---|
| `200` with the `suggestedWindow` (`start`, `end`) and, when set, the `explanationURL` | The certificate is issued and not archived under the `RA Profile` of the request and has a renewal window |
| `400` with the ACME error `malformed` | The certificate identifier cannot be read |
| `404` | Renewal information is off or the profile is disabled, the certificate is unknown, or it has no window |

The `Retry-After` and `Cache-Control: max-age` headers of a `200` answer carry the **Renewal information retry-after**. While the window of the certificate is forced by [early renewal](../../concept-design/core-components/ra-profile.md#early-renewal), they carry at most one hour, so that clients pick up the forced window quickly.

The certificate is looked up among the certificates of one `RA Profile`: the `RA Profile` of the URL, or the default `RA Profile` of the `ACME Profile`. Through the ACME API of the `ACME Profile`, renewal information therefore needs a default `RA Profile`; without one every request answers `404`.

### Replacing a certificate

A client that renews a certificate can name it in the `replaces` field of the new order. When renewal information is on, the platform checks the field and answers:

| Answer | When |
|---|---|
| `400` with the ACME error `malformed` | The certificate cannot be replaced by this order: it is unknown, it is not an issued certificate of the `RA Profile`, it was ordered by another account, or it shares no identifier with the order. The answer is the same in each case, so it reveals nothing about other accounts |
| `409` with the ACME error `alreadyReplaced` | Another order that is still live already replaces the certificate, or it already has an issued successor |

An accepted `replaces` is stored with the order and returned in the order object. When the order is finalized, the platform renews the certificate if the CSR keeps its key, rekeys it if the CSR has a new key, and otherwise issues a new certificate. In each case the new certificate is the [successor](../../concept-design/core-components/certificate.md#relations) of the replaced one. When the platform renews or rekeys, the connector can tell the upstream CA which certificate is replaced.

The replaced certificate is not revoked. It is no longer due for renewal, and the **Certificate expiring** and **Certificate renewal due** events stop for it.

When renewal information is off, `replaces` is ignored as in earlier versions: it is not checked, stored or returned.

## Pre-authorized identifiers

By default, a client proves control of every identifier it orders with a challenge. An `ACME Profile` can list identifiers that its accounts may obtain **without** that proof, on both the ACME endpoints of the `ACME Profile` and the ones of the `RA Profile`. When every identifier of an order is covered by the list, the order is ready as soon as it is created: its authorizations are already valid and no challenge is issued.

Pre-authorization is a decision of the operator that a certain set of identifiers can be issued to any account of the profile. Use it for identifiers the accounts of the profile are trusted to obtain, for example in a closed environment, and combine it with [External Account Binding](external-account-binding.md) to decide who may register an account.

### Entries

Each entry has a **Type**, an **Identifier**, a **Match** (`Exact` or `Subdomain`) and a **Wildcard** allowance. The identifier types, and the match types each of them supports, are described in the [Core ACME API](/api/core-acme#tag/acme-profile-management/POST/v1/acmeProfiles). An entry covers identifiers of its own type and no other.

An entry is an identifier, never a pattern. An entry that could never match anything is refused when the profile is saved, for example a malformed value, a value with `*`, or a match type or wildcard allowance that its identifier type does not support.

### Matching

- `Exact` covers that identifier only. `Subdomain` covers the identifiers below the value at any depth, but not the value itself, so covering both takes two entries.
- A wildcard identifier is covered only by an entry with the **Wildcard** allowance that covers everything the wildcard stands for, which means a `Subdomain` entry whose value is the parent of the wildcard or an identifier above it.

### Identifiers that are not covered

The profile decides what happens to an ordered identifier that no entry covers (`identifierAuthorizationMode` in the API):

- **Pre-authorized or Challenge** (default) — the identifier goes through the usual challenge validation. A profile with an empty list therefore validates every identifier with a challenge.
- **Pre-authorized Only** — the order is refused with the ACME error `rejectedIdentifier`. This mode needs at least one entry. To stop a profile from accepting orders, disable new orders instead.

An order that mixes covered and uncovered identifiers pre-authorizes the covered ones and applies the mode to the others.

## Operations on `ACME Profile`

The following operations can be performed on the `ACME Profile`:

| Operation   | Description                                                                     |
|-------------|---------------------------------------------------------------------------------|
| **Create**  | Create a new `ACME Profile`. Create `ACME Profile` is disabled by default       |
| **Update**  | Update configuration of already created `ACME Profile`                          |
| **Delete**  | Delete existing `ACME Profile`                                                  |
| **Disable** | Disable `ACME Profile`. All request to disabled `ACME Profile` will be rejected |
| **Enable**  | Enable `ACME Profile`                                                           |

:::info
`ACME Profile` should be in enabled state for the clients to use it. If the `ACME Profile` is disabled, the server throws error that the profile is not enabled and cannot process any requests.
:::
