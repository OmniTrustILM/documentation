---
sidebar_position: 2
---

# Configure Notification Instance

Create a [`Notification`](../../concept-design/core-components/notification.md) instance of the Email Notification Provider with the kind `EMAIL`. An instance is one sender with one subject and content; create more instances when notifications need different senders or templates.

## Instance attributes

| Attribute              | Content Type | Description                                                        |
|------------------------|--------------|--------------------------------------------------------------------|
| Sender email address   | `STRING`     | E-mail address the notifications are sent from                     |
| Email subject          | `STRING`     | Subject of the e-mail, a plain-text [template](templates.md)       |
| Email content template | `CODEBLOCK`  | Content of the e-mail, an HTML [template](templates.md)            |

## Mapping attributes

The connector declares one [mapping attribute](../../concept-design/core-components/notification.md#mapping-attributes):

| Mapping attribute       | Content Type | Description                                         |
|-------------------------|--------------|-----------------------------------------------------|
| Recipient email address | `STRING`     | E-mail address(es) the notification is delivered to |

Map it to the [custom attribute](../../settings/custom-attributes.md) that holds the e-mail address of your recipients. The e-mail is then sent to the e-mail address of the user, group or role, and to the addresses in the mapped attribute. A group or role without an e-mail address of its own is skipped, whatever its mapped attribute holds, and an Object recipient has only the mapped attribute.

The mapped attribute can hold several addresses, as several values or as one value with the addresses separated by `,` or `;`. Invalid addresses are skipped.

## Use in a notification profile

Select the instance in a [notification profile](../../concept-design/core-components/notification-profile.md) and choose its recipients; the recipient type `None` is not supported for e-mail. A recipient without a usable address is skipped with a warning, and when no recipient has one, the notification fails.

To include data about the event's object in the e-mail, such as its custom attributes or its owner, enable [event data](../../concept-design/core-components/notification-profile.md#event-data) on the profile and use it in the [templates](templates.md).
