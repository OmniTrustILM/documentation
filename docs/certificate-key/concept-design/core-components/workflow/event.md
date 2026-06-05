---
sidebar_position: 12
---

# Events

Events can occur when there is a change in a lifecycle of objects (for example change of state, performed action, etc.).
In case of so-called monitoring event, it can occur as part of scheduled monitoring of objects that match some state and properties that needs attention of users.

Events are linked with resource to specify type of objects that are subject of the event (e.g. certificate, discovery, etc.).

## Events automation

The platform provides a sophisticated workflow system that can be utilized for automation.
Each event can be associated with triggers that are executed when event occurs. That can be configured on [platform settings](../../../settings/events.md) or on overriding resource object.

Event triggers are automated mechanisms that respond to specific events within the platform and allows to:
- Automate responses to certificate lifecycle events
- Implement custom business logic for event handling
- Create complex workflow automation
- Ensure compliance with organizational policies
- Integrate with external systems and processes
- Notify based on configured notification profiles

## Supported events

| Event                        | Resource      | Overridden By     | Monitoring                                    | Description                                                                                    | Additional information                                                                                                                                                                                      |
|------------------------------|---------------|-------------------|-----------------------------------------------|------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Certificate status changed   | Certificate   | RA profile, Group | <span class="badge badge--danger">NO</span>   | Occurs when the certificate validation status change                                           | [`CertificateStatusChangedEventData`](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/master/src/main/java/com/czertainly/api/model/common/events/data/CertificateStatusChangedEventData.java)     |
| Certificate action performed | Certificate   | RA profile, Group | <span class="badge badge--danger">NO</span>   | Occurs after certificate operation (e.g.: issue, renew, rekey, revoke, etc.) was completed     | [`CertificateActionPerformedEventData`](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/master/src/main/java/com/czertainly/api/model/common/events/data/CertificateActionPerformedEventData.java) |
| Certificate expiring         | Certificate   | RA profile, Group | <span class="badge badge--success">YES</span> | Occurs every hour when there are expiring certificates that does not contain valid replacement | [`CertificateExpiringEventData`](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/master/src/main/java/com/czertainly/api/model/common/events/data/CertificateExpiringEventData.java)               |
| Certificate discovered       | Certificate   | Discovery         | <span class="badge badge--danger">NO</span>   | Occurs when the certificate has been newly discovered                                          | [`CertificateDiscoveredEventData`](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/master/src/main/java/com/czertainly/api/model/common/events/data/CertificateDiscoveredEventData.java)           |
| Certificate uploaded         | Certificate   |                   | <span class="badge badge--danger">NO</span>   | Occurs when a certificate is manually uploaded. Evaluates ignore triggers and action triggers. | See [Certificate Uploaded event](#certificate-uploaded-event)                                                                                                                                               |
| Discovery finished           | Discovery     |                   | <span class="badge badge--danger">NO</span>   | Occurs when discovery process has been finished                                                | [`DiscoveryFinishedEventData`](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/master/src/main/java/com/czertainly/api/model/common/events/data/DiscoveryFinishedEventData.java)                   |
| Approval requested           | Approval      |                   | <span class="badge badge--danger">NO</span>   | Occurs when requesting approval                                                                | [`ApprovalEventData`](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/master/src/main/java/com/czertainly/api/model/common/events/data/ApprovalEventData.java)                                     |
| Approval closed              | Approval      |                   | <span class="badge badge--danger">NO</span>   | Occurs after approval was closed                                                               | [`ApprovalEventData`](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/master/src/main/java/com/czertainly/api/model/common/events/data/ApprovalEventData.java)                                     |
| Scheduled job finished       | Scheduled job |                   | <span class="badge badge--danger">NO</span>   | Occurs when scheduled job execution finished                                                   | [`ScheduledJobFinishedEventData`](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/master/src/main/java/com/czertainly/api/model/common/events/data/ScheduledJobFinishedEventData.java)             |

## Certificate Uploaded event

The **Certificate Uploaded** event fires when a certificate is manually uploaded to the platform; it does not fire for certificates that enter the inventory through issuance or discovery. It is the entry point for evaluating the platform [triggers](./trigger.md) configured for this event in [Settings → Events](../../../settings/events.md), in two stages:

1. **Ignore triggers** — evaluated first. If the certificate matches an ignore trigger it is rejected and **not added to the inventory**.
2. **Action triggers** — evaluated only after the ignore triggers pass, and only for certificates that are kept. They categorize the certificate by setting its properties — Groups, RA profile, and Owner — and its [custom attributes](../../../settings/custom-attributes.md), and may also send notifications through the configured notification profiles.

Custom attributes supplied in the upload request itself take precedence over those set by action triggers: the request values are applied after the triggers run and override any conflicting trigger-set values.

The upload can be processed synchronously or asynchronously. With asynchronous upload the request is accepted immediately and the certificate appears in the inventory once processing — including trigger evaluation — completes.

### Ignored (rejected) certificates

When a certificate is rejected by an ignore trigger it is excluded from the certificate inventory. The rejection is still recorded in the **Certificate Uploaded** event history, including the ignore trigger that matched, so administrators can see that an upload was rejected. The event history does not retain the rejected certificate's own details, however; to identify the specific certificate, consult the [audit logs](../../../logging/audit-logs.md) with verbose logging enabled.
