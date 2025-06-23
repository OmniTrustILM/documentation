---
sidebar_position: 12
---

# Events

CZERTAINLY defines list of events that can occur when there is a change in lifecycle of objects (change of state, performed action, etc.).
In case of so called monitoring event, event can occur as part of scheduled monitoring of objects that match some state and properties that needs attention of users.

Events are linked with resource to specify type of objects are subject of such event (e.g. certificate, discovery, etc.)


## Events automation

CZERTAINLY platform provides a sophisticated workflow system that can be utilized when talking about automatization.
Each event can be associated with triggers that should be performed when that event occurs. That can be done on platform level in settings or if an event allows it, on level of overriding resource objects.

Event triggers are automated mechanisms that respond to specific events within the CZERTAINLY platform. They enable organizations to:
- Automate responses to certificate lifecycle events
- Implement custom business logic for event handling
- Create complex workflow automation
- Ensure compliance with organizational policies
- Integrate with external systems and processes
- Notify based on configured notification profile and when conditions are met

## Supported events

| Event                        | Resource      | Overrides         | Monitoring                                    | Description                                                                                                             | Additional information                                                                                                                                                                                      |
|------------------------------|---------------|-------------------|-----------------------------------------------|-------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Certificate status changed   | Certificate   | RA profile, Group | <span class="badge badge--danger">NO</span>   | Occurs when the certificate validation status change with detail about the certificate                                  | [`CertificateStatusChangedEventData`](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/master/src/main/java/com/czertainly/api/model/common/events/data/CertificateStatusChangedEventData.java)     |
| Certificate action performed | Certificate   | RA profile, Group | <span class="badge badge--danger">NO</span>   | Occurs after certificate action (e.g.: issue, renew, rekey, revoke, etc.) was completed with detail about its execution | [`CertificateActionPerformedEventData`](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/master/src/main/java/com/czertainly/api/model/common/events/data/CertificateActionPerformedEventData.java) |
| Certificate expiring         | Certificate   | RA profile, Group | <span class="badge badge--success">YES</span> | Occurs after hourly scheduled check of expiring certificates without renewal                                            | [`CertificateExpiringEventData`](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/master/src/main/java/com/czertainly/api/model/common/events/data/CertificateExpiringEventData.java)               |
| Certificate discovered       | Certificate   | Discovery         | <span class="badge badge--danger">NO</span>   | Occurs when the certificate has been newly discovered by some discovery                                                 | [`CertificateDiscoveredEventData`](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/master/src/main/java/com/czertainly/api/model/common/events/data/CertificateDiscoveredEventData.java)           |
| Discovery Finished           | Discovery     |                   | <span class="badge badge--danger">NO</span>   | Occurs when discovery has been finished                                                                                 | [`DiscoveryFinishedEventData`](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/master/src/main/java/com/czertainly/api/model/common/events/data/DiscoveryFinishedEventData.java)                   |
| Approval requested           | Approval      |                   | <span class="badge badge--danger">NO</span>   | Occurs when requesting approval on specific operation included                                                          | [`ApprovalEventData`](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/master/src/main/java/com/czertainly/api/model/common/events/data/ApprovalEventData.java)                                     |
| Approval closed              | Approval      |                   | <span class="badge badge--danger">NO</span>   | Occurs after approval was closed informing about the result of approval process                                         | [`ApprovalEventData`](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/master/src/main/java/com/czertainly/api/model/common/events/data/ApprovalEventData.java)                                     |
| Scheduled job finished       | Scheduled job |                   | <span class="badge badge--danger">NO</span>   | Notification about scheduled job execution finished with result and detail of its execution                             | [`ScheduledJobFinishedEventData`](https://github.com/CZERTAINLY/CZERTAINLY-Interfaces/blob/master/src/main/java/com/czertainly/api/model/common/events/data/ScheduledJobFinishedEventData.java)             |
