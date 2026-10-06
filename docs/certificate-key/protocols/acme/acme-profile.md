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
| **Pre-authorized identifiers**                      | Identifiers that accounts may obtain without proving control of them. See [Pre-authorized identifiers](#pre-authorized-identifiers) | none                 | <span class="badge badge--danger">No</span>   |
| **Identifier authorization**                        | What happens to an identifier that the pre-authorized identifiers do not cover      | `Pre-authorized or Challenge` | <span class="badge badge--danger">No</span>   |

By default `ACME Profiles` will be created without any default `RA Profile`, if not selected any.

## Pre-authorized identifiers

By default, a client proves control of every identifier it orders with an `http-01` or `dns-01` challenge. An `ACME Profile` can list identifiers that its accounts may obtain **without** that proof. When every identifier of an order is covered by the list, the order is ready as soon as it is created: its authorizations are already valid and no challenge is issued.

Pre-authorization is a decision of the operator that a certain set of names or addresses can be issued to any account of the profile. Use it for names the accounts of the profile are trusted to obtain, for example in a closed environment, and combine it with [External Account Binding](external-account-binding.md) to decide who may register an account.

### Entries

Each entry of the list has:

| Property     | Description                                                                                                                                                                |
|--------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Type**     | `DNS` for a DNS name, `IP` for an IP address ([RFC 8738](https://datatracker.ietf.org/doc/html/rfc8738)). An entry covers identifiers of its own type and no other      |
| **Value**    | The DNS name or the IP address                                                                                                                                             |
| **Match**    | `Exact` covers that identifier only. `Subdomain` covers the names below the value at any depth, but not the value itself, so covering both takes two entries              |
| **Wildcard** | Whether the wildcard identifier of the entry, such as `*.apps.example.com`, can also be pre-authorized                                                                     |

- DNS names are compared without regard to case. An IP address is always matched exactly, by its value, however it is written; an `IP` entry cannot use `Subdomain` or a wildcard.
- An entry is a name or an address, never a pattern. A value with `*` does not match anything and is refused.
- A wildcard identifier is covered only when its entry allows it and the entry covers everything the wildcard stands for, which means a `Subdomain` entry whose value is the parent of the wildcard or a name above it.

The following table shows which identifiers are covered by an entry:

| Ordered identifier        | `Exact` `server01.example.com` | `Subdomain` `apps.example.com` | `Subdomain` `apps.example.com` with wildcard |
|---------------------------|--------------------------------|--------------------------------|----------------------------------------------|
| `server01.example.com`    | covered                        | no                             | no                                           |
| `SERVER01.example.com`    | covered                        | no                             | no                                           |
| `apps.example.com`        | no                             | no                             | no                                           |
| `web.apps.example.com`    | no                             | covered                        | covered                                      |
| `db.eu.apps.example.com`  | no                             | covered                        | covered                                      |
| `other.example.com`       | no                             | no                             | no                                           |
| `*.apps.example.com`      | no                             | no                             | covered                                      |

### Identifiers that are not covered

The **Identifier authorization** setting decides what happens to an ordered identifier that no entry covers:

- **Pre-authorized or Challenge** (default) — the identifier goes through the usual `http-01` and `dns-01` validation. A profile with an empty list therefore behaves as it did before.
- **Pre-authorized Only** — the order is refused with the ACME error `rejectedIdentifier`. This mode needs at least one entry.

An order that mixes covered and uncovered identifiers pre-authorizes the covered ones and applies the setting to the others. To stop a profile from accepting any orders, disable new orders instead of using an empty list with **Pre-authorized Only**.

The policy applies to both the ACME endpoints of the `ACME Profile` and the ones of the `RA Profile`. The platform refuses to save entries that cannot match anything, such as a malformed name or address, or an `IP` entry that uses `Subdomain` or a wildcard.

### Operations on `ACME Profile`

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
