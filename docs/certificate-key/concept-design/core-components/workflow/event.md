---
sidebar_position: 12
---

# Events

Events can occur when there is a change in the lifecycle of objects (for example, change of state, performed action, etc.).
Monitoring events fire as part of scheduled monitoring, when an object's state or properties require user attention.

Events are linked to a resource to specify the type of objects that are the subject of the event (e.g. certificate, discovery, etc.).

## Events automation

The platform provides a sophisticated workflow system that can be utilized for automation.
Each event can be associated with triggers that are executed when the event occurs. Triggers can be configured in [platform settings](../../../settings/events.md) or on an overriding resource object. To inspect what happened when triggers ran, use the [Event Viewer](./event-viewer.md).

Event triggers are automated mechanisms that respond to specific events within the platform and allow you to:
- Automate responses to certificate lifecycle events
- Implement custom business logic for event handling
- Create complex workflow automation
- Ensure compliance with organizational policies
- Integrate with external systems and processes
- Notify based on configured notification profiles

## Supported events

| Event                        | Resource      | Overridden By     | Monitoring                                    | Description                                                                                    | Event Data                                                                                                                                                                                                  |
|------------------------------|---------------|-------------------|-----------------------------------------------|------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Certificate status changed   | Certificate   | RA profile, Group | <span class="badge badge--danger">NO</span>   | Occurs when the certificate validation status changes                                          | [`CertificateStatusChangedEventData`](https://github.com/OmniTrustILM/interfaces/blob/main/src/main/java/com/otilm/api/model/common/events/data/CertificateStatusChangedEventData.java)     |
| Certificate action performed | Certificate   | RA profile, Group | <span class="badge badge--danger">NO</span>   | Occurs after certificate operation (e.g.: issue, renew, rekey, revoke, etc.) was completed     | [`CertificateActionPerformedEventData`](https://github.com/OmniTrustILM/interfaces/blob/main/src/main/java/com/otilm/api/model/common/events/data/CertificateActionPerformedEventData.java) |
| Certificate expiring         | Certificate   | RA profile, Group | <span class="badge badge--success">YES</span> | Occurs every hour when there are expiring certificates that do not contain a valid replacement | [`CertificateExpiringEventData`](https://github.com/OmniTrustILM/interfaces/blob/main/src/main/java/com/otilm/api/model/common/events/data/CertificateExpiringEventData.java)               |
| Certificate discovered       | Certificate   | Discovery         | <span class="badge badge--danger">NO</span>   | Occurs when the certificate has been newly discovered                                          | [`CertificateDiscoveredEventData`](https://github.com/OmniTrustILM/interfaces/blob/main/src/main/java/com/otilm/api/model/common/events/data/CertificateDiscoveredEventData.java)           |
| [Certificate uploaded](#certificate-uploaded-event) | Certificate |                   | <span class="badge badge--danger">NO</span>   | Occurs when a certificate is manually uploaded                                                | [`CertificateEventData`](https://github.com/OmniTrustILM/interfaces/blob/main/src/main/java/com/otilm/api/model/common/events/data/CertificateEventData.java)                                                                |
| Discovery finished           | Discovery     |                   | <span class="badge badge--danger">NO</span>   | Occurs when discovery process has been finished                                                | [`DiscoveryFinishedEventData`](https://github.com/OmniTrustILM/interfaces/blob/main/src/main/java/com/otilm/api/model/common/events/data/DiscoveryFinishedEventData.java)                   |
| Approval requested           | Approval      |                   | <span class="badge badge--danger">NO</span>   | Occurs when requesting approval                                                                | [`ApprovalEventData`](https://github.com/OmniTrustILM/interfaces/blob/main/src/main/java/com/otilm/api/model/common/events/data/ApprovalEventData.java)                                     |
| Approval closed              | Approval      |                   | <span class="badge badge--danger">NO</span>   | Occurs after approval was closed                                                               | [`ApprovalEventData`](https://github.com/OmniTrustILM/interfaces/blob/main/src/main/java/com/otilm/api/model/common/events/data/ApprovalEventData.java)                                     |
| Scheduled job finished       | Scheduled job |                   | <span class="badge badge--danger">NO</span>   | Occurs when scheduled job execution finished                                                   | [`ScheduledJobFinishedEventData`](https://github.com/OmniTrustILM/interfaces/blob/main/src/main/java/com/otilm/api/model/common/events/data/ScheduledJobFinishedEventData.java)             |

### Certificate Uploaded event

The **Certificate Uploaded** event fires when a certificate is manually uploaded to the platform. It does not fire for certificates that enter the inventory through issuance or discovery — those have their own events.

When the event fires, the platform evaluates the [triggers](./trigger.md) configured for it in [Settings → Events](../../../settings/events.md) in two stages:

1. **Ignore triggers** are evaluated first. If the certificate matches any ignore trigger, it is rejected and **not added to the inventory**.
2. **Action triggers** are evaluated for certificates that pass the ignore stage. They categorize the certificate — setting its Groups, RA profile, Owner, and [custom attributes](../../../settings/custom-attributes.md) — and can send notifications through the configured notification profiles.

Unlike most certificate events, **Certificate Uploaded cannot be overridden per RA profile or Group**. Its triggers are configured only at the platform level.

Custom attribute values supplied in the upload request take precedence: they are applied after the action triggers run and override any conflicting values the triggers set.

The upload can be processed synchronously or asynchronously. A synchronous upload returns once the certificate has been processed and added to the inventory. An asynchronous upload returns immediately, and the certificate appears in the inventory once processing — including trigger evaluation — has completed.

#### Rejected uploads

A certificate upload is rejected in either of these cases:

- **Ignore trigger match** — the certificate matches one of the configured ignore triggers.
- **Duplicate** — a certificate with the same fingerprint already exists in the inventory.

In both cases the certificate is not added to the inventory.

Ignore-trigger rejections are recorded in the **Certificate Uploaded** event history together with the matching ignore trigger, so administrators can see that an upload was rejected. The event history does not retain the rejected certificate's own details. To identify the specific certificate, use one of:

- The [audit logs](../../../logging/audit-logs.md), with verbose audit logging enabled in the [logging settings](../../../settings/logging.md).
- The notification message produced by the configured notification profile for this event. The notification carries the event's [`CertificateEventData`](https://github.com/OmniTrustILM/interfaces/blob/main/src/main/java/com/otilm/api/model/common/events/data/CertificateEventData.java) payload, which identifies the certificate but does not include the complete certificate.

Duplicate rejections are detected before the **Certificate Uploaded** event fires and are therefore not recorded in its event history; the duplicate is reported by the upload request itself.
