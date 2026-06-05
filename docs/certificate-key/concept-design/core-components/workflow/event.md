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
| Discovery finished           | Discovery     |                   | <span class="badge badge--danger">NO</span>   | Occurs when discovery process has been finished                                                | [`DiscoveryFinishedEventData`](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/master/src/main/java/com/czertainly/api/model/common/events/data/DiscoveryFinishedEventData.java)                   |
| Approval requested           | Approval      |                   | <span class="badge badge--danger">NO</span>   | Occurs when requesting approval                                                                | [`ApprovalEventData`](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/master/src/main/java/com/czertainly/api/model/common/events/data/ApprovalEventData.java)                                     |
| Approval closed              | Approval      |                   | <span class="badge badge--danger">NO</span>   | Occurs after approval was closed                                                               | [`ApprovalEventData`](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/master/src/main/java/com/czertainly/api/model/common/events/data/ApprovalEventData.java)                                     |
| Scheduled job finished       | Scheduled job |                   | <span class="badge badge--danger">NO</span>   | Occurs when scheduled job execution finished                                                   | [`ScheduledJobFinishedEventData`](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/master/src/main/java/com/czertainly/api/model/common/events/data/ScheduledJobFinishedEventData.java)             |

## Event Viewer

The **Event Viewer** provides a historical view of event firings and the trigger evaluations that took place during each firing. It lets administrators audit how the platform responded to events, inspect which objects were matched or ignored, and diagnose [trigger](./trigger.md) failures, including which [conditions](./condition.md) were matched and which [actions](./action.md) ran. It complements the [event logs](../../../logging/event-logs.md), which record the raw event occurrences, by showing the outcome of the triggers evaluated for each firing.

The Event Viewer is available in two places:

- **[Settings → Events](../../../settings/events.md)** — select an event to see all of its past firings across the platform (global event history).
- **Object detail pages** — open the **Event History** tab on the detail page of a Certificate, Discovery, Cryptographic Key, or Approval to see the firings scoped to that specific object.

### Global event history

Each firing is listed with its status, when it started and finished, the affected resource, and a summary of how many objects were **evaluated**, **matched** (by at least one trigger), and **ignored** (matched by an ignore trigger). A firing has one of three statuses: **In Progress**, **Finished**, or **Failed**.

Expanding a firing reveals the per-object breakdown — the triggers evaluated against each object — and expanding an object shows the individual evaluation records: each condition that was not matched and each action that was not performed, with any error message. The firings list and the per-object list are paginated independently.

### Per-object event history

The **Event History** tab on an object's detail page shows a flat list of the trigger evaluations that involved that object: the event, the trigger, the source object, whether the trigger's conditions matched and its actions were performed, the time it was triggered, and a message. Each row expands into the same evaluation records as the global view. From the **Event** column you can jump to the global event history filtered to that object.

### Notification proof

When a trigger sends a notification, its evaluation record confirms whether the notification was sent. A successful send leaves no error on the record; a failure is recorded together with information about the notification profile and the channel type (internal or external) — providing proof of whether a notification was delivered.

### Trigger history retention

Trigger evaluation records are retained even after the trigger that produced them is deleted, so the event history remains a complete audit trail.
