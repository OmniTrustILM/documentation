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

By default `ACME Profiles` will be created without any default `RA Profile`, if not selected any.

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
