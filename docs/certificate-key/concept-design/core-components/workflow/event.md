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
