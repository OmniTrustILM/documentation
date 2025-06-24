---
sidebar_position: 21
---

# Notification Profile

The `Notification Profile` represents configuration how notifications are handled when used:
- **Who** should receive notification (recipients)
- **How** notification should be delivered (internal/external)
- **When** and **how often** notification should be sent
- **Which notification provider** to use for external delivery (like email, webhook, etc.)

`Notification Profile` has the following properties:

| Parameter             | Description                                                                                                                                                                                  |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Name                  | The distinctive label assigned to the `Notification Profile`                                                                                                                                 |
| UUID                  | The universally unique identifier uniquely representing the `Notification Profile`                                                                                                           |
| Description           | A concise yet informative explanation detailing the purpose and characteristics of the `Notification Profile`                                                                                |
| Recipient type        | Which [notification recipient](../architecture/notifications.md#notification-recipients) type should be used                                                                                 |
| Recipients            | List of specific recipients of chosen type. Applicable with user, groups and roles                                                                                                           |
| Notification instance | Defines which notification provider and instance should be used. It represents notification channel                                                                                          |
| Internal notification | Indicates if internal notification should be executed or not                                                                                                                                 |
| Frequency             | Used when notifying in context of monitoring events. It specifies interval between consecutive notifications and controls how often to repeat notification from the time when it was created |
| Repetitions           | Used when notifying in context of monitoring events. It specifies maximum number of notification repetitions                                                                                 |

:::note
`Notification Profile` is versioned to ensure that already pending notifications are not influenced by configuration changes.
:::

In case of notifying in context of monitoring events, notification system controls how often and how many notifications are sent to prevent spamming user with notifications carrying the same information.
Frequency and maximum repetitions are checked per notification profile, object and event that defines notification event.

:::note[Example of monitoring event]
When certificate expiring event is raised for certificate X, notification system will mark the time of lst notification of the event for certificate X through notification profile X and increment notification counter.
:::
