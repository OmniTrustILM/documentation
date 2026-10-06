---
sidebar_position: 2
---

# Configuration

Timestamping is configured through a [`Signing Profile`](/docs/signing/signing-profile). When you create or edit a `Signing Profile` and set the **Signing Workflow Type** to **Timestamping**, the **Workflow Properties** tab becomes available. That tab contains all settings specific to issuing RFC 3161 timestamp tokens, described below.

| Field | Required | Description |
|---|---|---|
| **Signature Formatting Connector** | Yes | The connector responsible for formatting the signature into the RFC 3161 timestamp token structure. See [Timestamp Formatting Connector](./timestamp-formatting-connector.md). |
| **Qualified Timestamp** | No | When enabled, the issued token carries the qualified electronic time-stamp statement as required by eIDAS and ETSI EN 319 422, and the signing certificate must additionally carry the `QcCompliance` statement (ETSI EN 319 412-5) to be eligible. Defaults to `false`. |
| **Validate Signature** | No | When enabled, the produced timestamp signature is validated before the token is returned to the caller. Defaults to `false`. |
| **Time Quality Configuration** | Required when Qualified Timestamp is enabled | Defines the required clock accuracy and related time quality settings. See [Time Quality Configuration](./time-quality-configuration.md). |
| **Default TSA Policy OID** | No | The OID used when an incoming timestamp request does not specify a policy ID. |
| **Allowed TSA Policy OIDs** | No | List of OIDs accepted in incoming timestamp requests. Requests carrying a policy OID not on this list are refused. When empty, all policy OIDs are accepted. |
| **Allowed Digest Algorithms** | No | List of digest algorithms accepted in incoming timestamp requests. Requests using an algorithm not on this list are refused. When empty, all digest algorithms are accepted. |

---

## TSA key

The certificate selected under [Signing Scheme](/docs/signing/signing-profile#signing-scheme) determines the TSA key. Any cryptography provider can hold it. The key can be RSA or ECDSA, or post-quantum: ML-DSA, SLH-DSA with a SHA2 parameter set, or FALCON-1024.

---

## Linking to a TSP Profile

A `Signing Profile` configured for timestamping must be associated with at least one [`TSP Profile`](./tsp-profile.md) before it can accept inbound RFC 3161 requests. The association supplies the authentication policy that guards the endpoint. Without it, the profile is configured but unreachable.

:::info[Prerequisite]
At least one `TSP Profile` must exist before you can activate the protocol. See [TSP Profile](./tsp-profile.md) for how to create one.
:::

### Activate from the Signing Profile

1. Open the `Signing Profile` detail page.
2. Select the **Protocols** tab. The **Timestamping** protocol row is listed with its current status and available actions.
3. Under **Actions**, click **Activate**.
4. In the dialog, select the `TSP Profile` you want to link to this `Signing Profile`.
5. Click **Activate** to confirm.

The `Signing Profile` is now associated with the selected `TSP Profile`. Clients can now reach this `Signing Profile` directly through the **Signing Profile route** (`/v1/protocols/tsp/signingProfiles/{signingProfileName}`).

Once activated, click on the **Timestamping** row in the table to expand its details. The detail view shows the current status and, most importantly, the **URL** your RFC 3161 clients should send timestamp requests to. The URL shown here is the **Signing Profile route** — it addresses the `Signing Profile` directly:

```
POST /v1/protocols/tsp/signingProfiles/{signingProfileName}
```

### Set from the TSP Profile

You can also link from the other direction by setting the **Default Signing Profile** on an existing `TSP Profile`. This makes the `Signing Profile` the target of all **TSP Profile route** requests (`/v1/protocols/tsp/{tspProfileName}`) where no explicit `Signing Profile` is named. See [TSP Profile — Default Signing Profile](./tsp-profile.md#default-signing-profile) for details.

When using this route, the endpoint URL is keyed by the `TSP Profile` name and is available on the `TSP Profile` detail page:

```
POST /v1/protocols/tsp/{tspProfileName}
```

Use the Signing Profile route when you want to target a specific `Signing Profile` explicitly; use the TSP Profile route when clients should resolve to whichever `Signing Profile` is set as the default on the `TSP Profile`.

:::warning[Association not visible on the Signing Profile]
When the association is created from the `TSP Profile` side (by setting it as the default `Signing Profile`), it is **not reflected on the `Signing Profile` detail page**. The Protocols tab on the `Signing Profile` will not show this link. To inspect or manage the association, navigate to the `TSP Profile` directly.
:::
