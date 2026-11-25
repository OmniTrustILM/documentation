---
sidebar_position: 7
---

# RA Profile

## What is `RA Profile`?

`RA Profile` is a representation of attributes that collectively provides a complete configuration of the certificate service which can be used by users and applications in a consistent and convenient way.

`RA Profile` provides an abstraction of the certificate management service configuration attributes:

- Certification Authority and its related information
- Certificate management technology-specific attributes
- Service-related configuration
- Access control configuration

Additionally, `RA Profile` uses the following attributes to identify the service:

- `RA Profile` Name
- Description

### Characteristics

Characteristics of `RA Profile` are:

- Binds the `Authority` and act as a specific certificate management service
- Configures the certificate specific attributes and defines the compliance rules and behavior
- Provide rules for issuing, renewing, and revocation of the certificate

### Process Flow

The following steps illustrate the process of requesting the certificate through the `RA Profile`:

1. `Client` requests the `RA Profile` to issue certificate providing the certificate signing request
2. `RA Profile` validates the certificate signing request against its configuration
3. `RA Profile` forwards the certificate signing request and related attributes to the `Authority Provider`
4. `Authority Provider` validates the certificate signing request and issues the certificate
5. `RA Profile` forwards the certificate to the `Client`

### Certificate Validation Settings

`RA Profile` can override platform certificate validation settings for certificates that are assigned to it. The following attributes are used to configure the certificate validation for the `RA Profile`:

| Name                                  | Description                                                                                                                                                         | Default Value |
|---------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| **Platform Validation Settings Used** | If enabled, platform settings will be used for validation of certificates associated with the RA Profile, otherwise RA Profile settings will be used for validation | `enabled`     |
| **Validation Enabled**                | Enable or disable validation of certificates associated with the RA Profile                                                                                         | `disabled`    |
| **Validation Frequency**              | Validation frequency of certificates associated with the RA Profile specified in days                                                                               | Everyday      |
| **Expiring Threshold**                | How many days before expiration should validation status of certificates associated with the RA Profile change to `Expiring`                                        | 30 days       |

## Renewal settings

The **Renewal** section of an `RA Profile` decides whether its certificates get a [renewal window](./renewal-window.md) and whether they are renewed automatically. All settings are off by default.

| Name | API key | Description | Default Value |
|---|---|---|---|
| **Enable Renewal Window** | `windowEnabled` | Gives each certificate of the profile a policy window, computed from its validity period | `disabled` |
| **Window Start (% of validity)** | `windowStartPercent` | Share of the validity period after which the window starts, from 1 to 99 | 67 |
| **Window End (% of validity)** | `windowEndPercent` | Share of the validity period after which the window ends, from 1 to 99 and higher than the start | 80 |
| **Use Renewal Window From Certificate Authority** | `useAuthorityRenewalInfo` | Asks the certificate authority for the window of each certificate and refreshes it regularly; see [Renewal information from the certificate authority](./renewal-window.md#renewal-information-from-the-certificate-authority). It can be turned on only when the connector of the `Authority` supports renewal information, which the profile shows (`authorityRenewalInfoSupported`) | `disabled` |
| **Enable Automatic Renewal** | `autoRenewalEnabled` | Allows a trigger to [renew the certificates](./workflow/execution.md#renew-certificate) of the profile when their renewal is due | `disabled` |
| **Maximum Renewal Attempts** | `autoRenewalMaxAttempts` | How many failed automatic renewals of a certificate, or of a certificate in one location, are tried before automatic renewal stops for it, from 1 to 20 | 5 |

Editing the renewal settings needs the `Update` permission on the `RA Profile`. The settings are saved together: a request through the API that leaves a setting out returns it to its default.

Changing the settings takes effect at once on the issued, unarchived and unexpired certificates of the profile:

- Turning the window on, or changing its percentages while it is on, computes the policy window of every certificate whose window is missing or came from the policy. A window set by the certificate authority or forced by an administrator is kept.
- Turning the window off removes the policy windows.
- Turning the certificate authority window on schedules its certificates for a refresh. Turning it off stops the refresh and removes the windows set by the certificate authority; each certificate falls back to its policy window, or to none.
- The automatic renewal settings are read each time the [Certificate renewal due](./workflow/event.md#certificate-renewal-due-event) event fires.

Enabling automatic renewal does not renew anything by itself: it also needs a trigger on the **Certificate renewal due** event whose action runs a `Renew certificate` execution.

## Early renewal

An administrator can ask for the early renewal of certificates without revoking them, for example before a planned change of the CA. **Request early renewal** forces a [renewal window](./renewal-window.md) from now to now plus a **spread** on each eligible certificate. The certificate holders, ACME clients and automatic renewal then renew within that window. The spread distributes the renewals over time and goes from 1 hour to 30 days; the web interface proposes 24 hours. An optional **Explanation URL**, an absolute `http` or `https` URL, is stored with the window and shown to the holders.

Early renewal can be requested for:

- **All certificates of an `RA Profile`**, from the **Renewal** section of the `RA Profile`. It needs the `Update` permission on the `RA Profile` and answers the number of certificates affected.
- **Selected certificates**, from the certificate list. It needs the `Renew` permission on each certificate. A certificate that is not eligible, or that the user may not renew, is skipped; the answer gives the number of skipped certificates.

A certificate is eligible when it is issued, not archived, not expired and has no issued successor. Certificates issued later are not affected. Early renewal works whether or not the renewal window settings of the profile are on.

Each affected certificate gets an `Update renewal window` entry with the source `Forced` in its history, and the request is recorded in the audit log as `Request early renewal` with the spread and the explanation URL. Nothing is revoked and no approval is asked; the renewals that follow go through the approval rules of the `RA Profile` as usual.

A forced window stays when the `RA Profile` of the certificate changes, unless a CA window that starts earlier has already replaced it. See [Effective window](./renewal-window.md#effective-window).

## Request attributes

`RA Profile` defines the request attributes of its certificate service — what the requester fills in on the request form and where each value lands in the issued certificate. If you are new to request attributes, read the [Request Attribute](./request-attribute.md) concept first.

Each `RA Profile` can author its own **static set** of request attributes — see [Configure request attributes](../../quick-start/certificate-management/create-ra-profile.mdx#configure-request-attributes) for the authoring walkthrough.

The set the profile actually uses is the **resolved set**. The profile's **merge mode** decides how its static set combines with the request attributes its authority connector declares (`Static only`, `Connector only` or `Merge`), and the platform default set applies when the result is empty. See [Where request-attribute sets come from](./request-attribute.md#where-request-attribute-sets-come-from).

## External CSR validation

When a client supplies its own CSR (an external CSR), the `RA Profile` validates it against the resolved request-attribute set. Two modes exist:

- **Strict** — non-compliant external CSRs are rejected.
- **Lenient** — non-compliant external CSRs are accepted; violations become warnings. The certificate is issued. The warnings are informational: they are returned as `requestAttributeWarnings` in the response of the REST issuance operations and shown on the issue form. See [Warnings under lenient validation](#warnings-under-lenient-validation).

Validation checks:

- every mapped field of a required attribute has a matching subject component, SAN entry, or extension in the CSR
- matched values satisfy the attribute's value constraints
- in strict mode additionally a whitelist pass: anything present in the CSR — a subject component, SAN type, Key Usage, Extended Key Usage, or extension — that is not covered by the resolved set is a violation

:::warning[Strict mode needs a deliberately authored set]
The whitelist runs against the resolved request-attribute set. With no authored set, the platform default applies — six subject (RDN) attributes that map no SAN types and no extensions — so **Strict** rejects any CSR carrying a SAN entry or an extension. In particular, ACME enrollment always fails, because ACME CSRs carry a `dNSName` SAN. Enable strict mode only on profiles whose authored set covers the SAN types and extensions your clients send; otherwise use **Lenient**.

Key Usage and Extended Key Usage are admitted by mapping an attribute to their own [typed targets](./request-attribute.md#mapping-targets); a new generic extension mapping for them is not accepted, while definitions saved earlier with one keep working. Other extensions that clients commonly place in a CSR, such as Basic Constraints, are [built in to the OID registry](../../settings/oid.md#built-in-certificate-extensions), so admitting them is a matter of mapping an attribute to them; no Custom OID entry is needed. Vendor-specific extensions, such as the [Microsoft certificate-template OIDs](../../settings/oid.md#windows--adcs-enrolment) sent by Windows autoenrolment, must be registered first.
:::

The mode is inherited along a chain: the profile's own setting, then the platform default, then **lenient** as the final fallback.

Configuration is per profile, in the web interface or API — see [Configure external CSR validation](../../quick-start/certificate-management/create-ra-profile.mdx#configure-external-csr-validation).

### Warnings under lenient validation

A warning is raised only for a CSR supplied by the client. A request the platform builds from a platform key never raises one. When the platform cannot check the request, because the connector's request attributes are unavailable, the request is accepted with a warning saying that the validation could not be performed.

The warnings are returned as `requestAttributeWarnings` in the response of the issue, issue-existing, renew and rekey operations. The field is also present in the response of the register operation but is always empty: registration is checked when the registered certificate is completed. The certificate is issued whether or not there are warnings.

Requests that arrive through ACME, SCEP and CMP are validated the same way, but nobody reads the warnings: they are written to the log. A violation under strict validation is returned as the error of the protocol.
