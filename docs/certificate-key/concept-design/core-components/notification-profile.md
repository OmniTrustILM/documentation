---
sidebar_position: 21
---

# Notification Profile

The `Notification Profile` represents configuration how notifications are handled when used such a profile.
They are versioned to ensure that already pending notifications are not influenced by configuration changes.
- **Who** should receive notifications (recipients)
- **How** notifications should be delivered (internal/external)
- **When** and **how often** notifications should be sent
- **Which notification provider** to use for external delivery

`Notification Profile` has the following properties:

| Parameter             | Description                                                                                                                                                 |
|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Name                  | The distinctive label assigned to the `Notification Profile`                                                                                                |
| UUID                  | The universally unique identifier uniquely representing the `Notification Profile`                                                                          |
| Description           | A concise yet informative explanation detailing the purpose and characteristics of the `Notification Profile`                                               |
| Recipient type        | Which notification recipient type should be used                                                                                                            |
| Recipients            | List of UUIDs of specific recipients of chosen type. Applicable with user, groups and roles                                                                 |
| Notification instance | Defines which notification provider and instance should be used. It represents notification channel.                                                        |
| Internal notification | Indicates if to send internal notification or not.                                                                                                          |
| Frequency             | Used when notifying in context of monitoring events. It specifies interval between consecutive notifications and controls how often to repeat notification. |
| Repetitions           | Used when notifying in context of monitoring events. It specifies maximum number of notification repetitions                                                |

:::note
`Notification Profile` is versioned to ensure that already pending notifications are not influenced by configuration changes.
:::

In case of notifying in context of monitoring events, notification system is controlling how often an how many notifications are sent to prevent spamming user with notifications carrying same information.
Frequency and max repetitions are checked per notification profile, object and event that defines notification event.

For example: when certificate expiring event is raised for certificate X, notification system will mark time when was the last time that this event was notified for certificate X through notification profile X and increment notification counter.  

