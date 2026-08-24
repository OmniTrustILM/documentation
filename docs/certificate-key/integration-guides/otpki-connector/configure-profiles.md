---
sidebar_position: 4
---

# Configure CA and Profiles

The connector issues certificates through an OTPKI **end entity profile**, which binds a **certificate profile** to a **certification authority**. All three must exist, and the end entity profile must accept what the connector supplies for each end entity it creates.

## Certification authority

Create or import the certification authority that signs the certificates. See [Certificate Authorities](https://docs.otpki.com/docs/operations/issuance-and-revocation/certificate-authorities/).

## Certificate profile

Create the certificate profile that describes the certificates to be issued, such as their validity, key usages, and extensions. See [Certificate Profiles](https://docs.otpki.com/docs/operations/issuance-and-revocation/certificate-profiles/).

If the certificate profile restricts the certification authorities it may be used with, include the certification authority above in that list. OTPKI applies the restrictions of the certificate profile and of the end entity profile together, and an `RA Profile` in the platform is built only from the lists of the end entity profile. A combination that the certificate profile does not allow can therefore be selected in the platform and fails at issuance.

If the certificates carry subject alternative names or other extensions taken from the certificate request, allow the certificate profile to override extensions from the request. The platform submits the certificate request as it is, so anything the certificate profile does not take from the request is left out of the issued certificate.

## End entity profile

Create the end entity profile and configure the following sections so that the connector can enroll through it. See [End Entity Profiles](https://docs.otpki.com/docs/operations/enrollment/end-entity-profiles/).

### Certificate profile and CA settings

Add the certificate profile and the certification authority above to the available lists, and select a default for each. OTPKI requires both defaults to save the profile.

The `RA Profile` in the platform offers only the certificate profiles and certification authorities that the selected end entity profile allows.

### Login ID configuration

The connector derives a login ID for every end entity it creates and supplies it to OTPKI. Configure the profile accordingly:

- The login ID must **not** be auto-generated. OTPKI silently replaces a supplied login ID with a random value when auto-generation is enabled, so the end entity is not named the way the `RA Profile` defines, and the login ID recorded with the certificate in the platform does not identify it in OTPKI.
- If the profile validates the login ID with a regular expression, the values that the `RA Profile` derives must match it. The expression is evaluated before the profile applies its own prefix and suffix.
- A login ID prefix or suffix configured on the profile is applied on top of the prefix and postfix configured on the `RA Profile`. Both pairs count towards the login ID that OTPKI finally stores.

### Subject configuration

The connector builds the end entity from the subject of the certificate request, and supplies no subject alternative names with it. A subject alternative name attribute that the profile marks as required, and for which it defines no default value, therefore rejects every issuance.

Leave such attributes optional, or give them a default value, and take the subject alternative names of the issued certificate from the certificate request through the certificate profile instead.

### Request limits

An end entity may submit as many enrollments as the profile allows, and the initial issuance consumes one of them. Renewing a certificate through the platform enrolls again against the same end entity, so with the default of a single allowed request a renewal is refused.

Raise the number of allowed requests to cover the renewals expected over the lifetime of the end entity, or allow renewal before expiration, which lets an end entity that already holds a certificate renew inside the configured window without consuming a request.

:::note[Both settings apply going forward]
The allowed request count seeds the end entity when it is created, so raising it does not refill an end entity that already exists, and the count cannot be set on one directly. Allowing renewal before expiration only permits a renewal within that many days of a certificate's expiry, so it does not unblock a certificate issued moments ago.

To recover an end entity that has already used its allowance, reset its status to **New** in OTPKI. That reapplies the profile allowance.
:::

### Password configuration

The connector sets a password on every end entity it creates:

- The password must **not** be auto-generated. OTPKI would replace the supplied password, and the value the connector derives would then no longer match the end entity, so operations that authenticate with it fail.
- If the profile enforces a minimum password strength, the password the connector supplies must satisfy it.

The value is derived from the end entity's login ID, so the connector never stores it and can recompute it for any later operation. How it is derived depends on the `OTPKI_LOGIN_PASSWORD_KEY` environment variable on the connector, or the `otpki.login.password.key` system property:

| `OTPKI_LOGIN_PASSWORD_KEY` | Password |
|----------------------------|----------|
| Set                        | Derived from the login ID with HMAC-SHA256 under that key |
| Unset                      | The login ID itself |

:::warning[The key cannot be rotated]
The derivation has to reproduce the same password for the whole life of an end entity. Setting, changing, or removing `OTPKI_LOGIN_PASSWORD_KEY` changes what the connector derives, so every end entity created under the previous setting keeps a password the connector can no longer reproduce, and operations that authenticate with it fail. Those end entities have to be recreated.

Decide the value before the first authority is used, and keep it with the connector's other secrets. Leaving it unset means the password equals the login ID, which is predictable to anyone who can see the end entity — set it unless a deployment has a reason not to.
:::

### Approval settings

Do not attach an approval profile to the end entity profile, the certificate profile, or the certification authority that an `RA Profile` in the platform uses. An approval profile can be attached to any of the three, and each of them gates a different part of the flow.

:::warning[Approval-gated profiles are refused, not held]
The connector refuses an approval-gated request immediately with `501 OPERATION_NOT_SUPPORTED`, and hides profiles with an approval profile attached from the `RA Profile` dropdowns. It does not advertise the `certificateStatusPolling` capability, so the platform never polls for the outcome and would mark an unpolled pending certificate failed while OTPKI issued it on approval — leaving an issued certificate outside the inventory. An immediate refusal is the safer outcome. See [Synchronous and asynchronous operations](../../connectors/provider-interfaces/authority-provider-v3.md#synchronous-and-asynchronous-operations).

An end entity created before the refusal is detected is left in OTPKI awaiting approval. It is inert, and the connector logs its identifier so it can be removed.

Use dedicated profiles without approvals for the platform, and keep approval workflows on the profiles used by other enrollment channels.
:::

For more information, refer to [Approval Profiles](https://docs.otpki.com/docs/operations/administration/approval-workflows/approval-profiles/).
