---
sidebar_position: 12.5
---

# Renewal Window

A **renewal window** is the period in which a certificate should be renewed. Each certificate has at most one window, its **effective window**, with a start, an end, a source and, optionally, an explanation URL that says why the window was set.

The window tells the holders of a certificate when to renew it:

- The [Certificate renewal due](./workflow/event.md#certificate-renewal-due-event) event fires while the window is open and the certificate is not renewed, so triggers can send notifications or [renew the certificate](./workflow/execution.md#renew-certificate).
- The ACME server of the platform serves the window to ACME clients as [renewal information](../../protocols/acme/acme-profile.md#renewal-information) (RFC 9773).

The window does not change the validation status of the certificate. `Expiring` still follows the expiring threshold, and the [Certificate expiring](./workflow/event.md) event fires independently of the window. Nothing is revoked because of a window.

Only a certificate with an [`RA Profile`](./ra-profile.md) can have a renewal window. Everything is off by default: a certificate gets a window only after an administrator turns one of its sources on, or requests early renewal.

## Sources

A window comes from one of three sources:

| Source | Code | Set by | Window |
|---|---|---|---|
| **Policy** | `policy` | The [renewal settings](./ra-profile.md#renewal-settings) of the `RA Profile`, when **Enable Renewal Window** is on | A share of the validity period: start = not before + lifetime × start percentage, end = not before + lifetime × end percentage. The defaults are 67 % and 80 % |
| **Certificate authority** | `authority` | The certificate authority, through the connector of the `Authority`, when **Use Renewal Window From Certificate Authority** is on and the connector supports renewal information. See [Renewal information from the certificate authority](#renewal-information-from-the-certificate-authority) | The window the CA suggests, with its explanation URL |
| **Forced** | `forced` | An administrator, with [early renewal](./ra-profile.md#early-renewal) | From the moment of the request to the request plus the spread, with the explanation URL given in the request |

## Effective window

The sources write the effective window by the following rules:

| Write | Rule |
|---|---|
| Policy, at issuance or when the policy changes | Sets the window only of certificates whose window is missing or came from the policy |
| Certificate authority, window available | Replaces a policy window and an earlier CA window. Replaces a forced window only when the CA window starts earlier than the forced one |
| Certificate authority, no advice for the certificate | Removes a CA window. The certificate falls back to the policy window, or to no window when the policy is off |
| Forced | Always replaces the window |
| Policy turned off | Removes policy windows |
| `RA Profile` of the certificate assigned, changed or removed | The policy and CA windows are computed again for the new `RA Profile`, or removed. A forced window stays |

Every change of the window writes one entry to the certificate history, `Update renewal window`, for example `Renewal window from 2026-12-01T10:00:00Z to 2026-12-15T10:00:00Z, source: Policy`, or `Renewal window removed`. A change also resets the time chosen for [automatic renewal](./workflow/execution.md#renew-certificate) and its failed attempts.

A change that moves the start earlier and comes from the CA or from an administrator marks the window as **advanced**. The flag is carried in the event data of [Certificate renewal due](./workflow/event.md#certificate-renewal-due-event).

A forced window cannot be cancelled. It is replaced by the next forced window, or by a CA window that starts earlier.

## Renewal due

A certificate is **due for renewal** when its window has started and it has no issued successor. Renewal keeps the window of the old certificate for its history, but the certificate is no longer due.

The certificate detail shows the window, its source, the explanation URL, when the window last changed, and a **Renewal due** badge. When automatic renewal is on for its `RA Profile`, it also shows how the certificate would be renewed, or why it cannot be. The certificate list can show the window start as an optional column. Certificates can be searched, and trigger conditions can test, by the fields **Renewal Window Start**, **Renewal Window End** and **Renewal Window Source**.

## Renewal information from the certificate authority

When an `RA Profile` uses the renewal window from the certificate authority, Core asks the connector of the `Authority` for the window of each certificate of the profile and refreshes it regularly. This needs a connector that implements [Authority Provider v3](../../connectors/provider-interfaces/authority-provider-v3.md#renewal-information) and advertises the capability `certificateRenewalInfo`. The `RA Profile` shows whether its authority supports it.

Only this refresh calls the connector. Reading a certificate, serving renewal information to ACME clients and the renewal due event read only the stored window.

The refresh works as follows:

- A certificate is refreshed while it is issued, not archived, not expired and has no issued successor, and while its `RA Profile` uses the CA window and its connector advertises the capability.
- A newly issued certificate, or one newly assigned to such an `RA Profile`, is asked about within five minutes. When the setting is turned on for an `RA Profile`, the first refreshes of its existing certificates are spread over the **Refresh Default Interval**.
- Core asks about the certificates of one `RA Profile` in batches of the **Refresh Batch Size**.
- After an answer, the next refresh follows the [retry-after rules](../../connectors/provider-interfaces/authority-provider-v3.md#retry-after-rules).
- When the CA does not know the certificate or has no advice for it, the CA window is removed and the certificate is asked about again after the **Refresh Re-check Interval**.
- When the connector fails, or cannot answer for a certificate yet, the refresh is retried after 5 minutes, 15 minutes, 1 hour and then every 6 hours, unless a retry-after time was given.
- When the connector does not offer the endpoint despite advertising the capability, the certificates of the batch are asked about again after the **Refresh Re-check Interval**.

The intervals and the batch size are [platform settings](../../settings/platform.md#renewal-information). Turning the setting off in the `RA Profile` stops the refresh, and its certificates fall back to the policy window.

The refresh runs on every Core replica. One replica at a time claims the certificates that are due, and a certificate claimed by a replica that stops is claimed again after the lease. Logs carry counts per sweep and never certificate content.

### Application properties

The schedule of the refresh is set by application properties of Core, as environment variables of its container:

| Property | Environment variable | Default | Description |
|---|---|---|---|
| `provider.renewal-info.sweep-interval-ms` | `PROVIDER_RENEWAL_INFO_SWEEP_INTERVAL_MS` | `60000` | How often, in milliseconds, each replica looks for certificates due for a refresh |
| `provider.renewal-info.max-per-authority` | `PROVIDER_RENEWAL_INFO_MAX_PER_AUTHORITY` | `200` | How many certificates of one `Authority` are claimed in one sweep |
| `provider.renewal-info.enrol-per-sweep` | `PROVIDER_RENEWAL_INFO_ENROL_PER_SWEEP` | `500` | How many certificates that have no refresh schedule yet are scheduled in one sweep |
| `provider.renewal-info.lease` | `PROVIDER_RENEWAL_INFO_LEASE` | `PT15M` | How long a claimed certificate stays claimed before another replica may claim it again |
| `provider.renewal-info.executor-threads` | `PROVIDER_RENEWAL_INFO_EXECUTOR_THREADS` | `4` | How many threads call connectors; the batches of one `Authority` run one after another |
| `provider.renewal-info.backoff` | | `PT5M, PT15M, PT1H, PT6H` | Delays after failed refreshes without a retry-after time; the last one repeats. Set in the application configuration only |

A missing, zero or negative value takes the default.
