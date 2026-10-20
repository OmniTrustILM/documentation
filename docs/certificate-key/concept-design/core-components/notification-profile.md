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
| Event data            | Categories of data about the event's object to include in external notifications. All disabled by default. See [Event data](#event-data)                                                    |

:::note
`Notification Profile` is versioned to ensure that already pending notifications are not influenced by configuration changes. The description and the [event data](#event-data) categories belong to the profile rather than to a version: changing them creates no new version and applies at once, also to pending notifications.
:::

In case of notifying in context of monitoring events, notification system controls how often and how many notifications are sent to prevent spamming user with notifications carrying the same information.
Frequency and maximum repetitions are checked per notification profile, object and event that defines notification event.

:::note[Example of monitoring event]
When certificate expiring event is raised for certificate X, notification system will mark the time of lst notification of the event for certificate X through notification profile X and increment notification counter.
:::

## Event data

A notification profile can add data about the object an event concerns to its external notifications. Each category is enabled separately, and all are disabled by default:

| Category          | Included data                                                                                         |
|-------------------|-------------------------------------------------------------------------------------------------------|
| Custom attributes | Content of the [custom attributes](../../settings/custom-attributes.md) assigned to the object         |
| Metadata          | Connector-sourced metadata of the object, grouped by the connector and source object that produced it |
| Associations      | The owner and groups of the object and, for certificates, its RA profile                              |
| Object content    | The content of the object when its type has one: for certificates, the Base64-encoded DER data        |

The data describes the event's **subject**: for approval and comment events, the object the approval or comment is about; for every other event, the event's own object. A category adds data only where the subject supports it, and nothing elsewhere: custom attributes and metadata where its resource has attributes, the owner and groups where its resource has them, and the RA profile and content for certificates.

The data is sent to the [notification provider](../../connectors/provider-interfaces/notification-provider.mdx#sending-notifications) as the `objectData` part of the notification request, next to the event's own data. It is loaded when the notification is sent, and reflects the object at that time. Loading is best effort, and the notification is sent in any case: a category that cannot be loaded or is too large is left out, and a long value is cut short and ends with `...[truncated]`. Treat every part of `objectData` as optional; the templates of the [Email Notification Provider](../../integration-guides/email-notification-provider/templates.md) and the [Webhook Notification Provider](../../integration-guides/webhook-notification-provider/templates.md) show how.

Object data never contains the values of secret or credential attributes, or the content of protected attribute definitions, whichever categories are enabled. This applies to object data only: the event's own data can carry a secret, such as the one-time credential of the [Certificate registered](workflow/event.md#certificate-registered-event) event.

:::info[Required permissions]
Enabling a category authorizes sending the object data to the notification instance of the profile. These categories therefore require additional permissions, without object-level restrictions, of the user who enables them, or who changes the notification instance while they are enabled:

- **Custom attributes** requires the `Members` action on the `Attribute` resource.
- **Object content** requires the `Detail` action on the `Certificate` resource and the `Members` action on the `RA Profile` resource.

The permissions are checked only at that time: losing them later does not disable a configured profile.
:::

:::note[Trust boundary]
Enable event data only for notification instances whose connector you trust with the data. A connector reached through a proxy receives its requests through the message broker, which is then part of that trust boundary.
:::
