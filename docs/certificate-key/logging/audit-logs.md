---
sidebar_position: 6
---

# Audit Logs

Audit log records all activities and operations in the platform initiated by some user. It can be used to reconstruct any event in case of investigation. It also proves the compliance with the various standards and regulations, such as PCI DSS, ISO 27k, GDPR, WebTrust, etc.

## Audit log structure

Audit logs have specific structure defined by [Log Record Structure](log-record-structure.md). This ensures that structure of audit log is consistent, can be validated and easily parsed by log collectors.

## Audit log persistence

Audit logs are typically shipped to the logging infrastructure, where they are stored and processed, for example, by the SIEM solution. The retention period of audit logs should be defined based on the organization's policy and the requirements of the regulations.

They can be stored in the database of the Core, but it is recommended to store them in a separate system to ensure their integrity and availability, including correlation with other log records, not only from the Core but also from other systems.

In case you do not want to collect audit logs, you can disable them in the settings.

## Delegated requests

For a request authenticated with an allowed [delegation token](../concept-design/architecture/access-control/identification.md#delegation-tokens), the actor remains the user and the audit record also contains `actor.delegate`. Its `identifier` is the configured claim inside the outermost `act`; its optional `subject` records `act.sub` when that is a non-blank string different from the identifier. See [Delegate](log-record-structure.md#delegate) for schema 1.2 and an example.

The administrator interface shows the delegate in the audit log list and record detail. Use the **Delegate** filter to find operations made by an integration on behalf of users. API searches use the `AUDIT_LOG_ACTOR_DELEGATE_IDENTIFIER` field identifier. CSV exports include `actorDelegateIdentifier` and `actorDelegateSubject`; these values are empty for records without a delegate. Core 2.21.0 continues to make existing records available through its existing filters and exports. Older Core readers cannot read delegate-bearing database records; see the [upgrade and downgrade notes](../installation-guide/upgrade-instructions.md#upgrading-to-2210).

A refused delegation token produces an authentication failure audit message naming the OAuth 2.0 provider and the delegate to allow, when an identifier can be resolved. Complete access tokens are never logged. Authentication failure messages use the existing redacted-token representation, which omits the signature; token payload claims may still appear in that representation. Nothing is executed after an authentication failure.

Certificate history and other objects' event history continue to name the user. Audit records created asynchronously by triggers and workflows also name the user only; the originating request's delegate is not propagated into those operations.
