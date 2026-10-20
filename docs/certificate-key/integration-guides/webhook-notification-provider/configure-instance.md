---
sidebar_position: 2
---

# Configure Notification Instance

Create a [`Notification`](../../concept-design/core-components/notification.md) instance of the Webhook Notification Provider with the kind `WEBHOOK`. An instance is one URL with one content configuration; create more instances when notifications go to different endpoints or need different bodies.

## Instance attributes

| Attribute        | Content Type | Description                                                           |
|------------------|--------------|-----------------------------------------------------------------------|
| Webhook URL      | `STRING`     | URL the request is sent to                                            |
| Content type     | `STRING`     | How the request body is built, see [content types](#content-types)    |
| Content template | `CODEBLOCK`  | Template of the request body. Not used with `RAW_JSON`                |

The connector declares no [mapping attributes](../../concept-design/core-components/notification.md#mapping-attributes): it delivers to the URL of the instance, not to addresses of the recipients.

## Content types

| Content type | Request body                                                  | `Content-Type` header |
|--------------|---------------------------------------------------------------|-----------------------|
| `RAW_JSON`   | The whole notification request as JSON, without a template    | `application/json`    |
| `JSON`       | Rendered from the content [template](templates.md)            | `application/json`    |
| `XML`        | Rendered from the content [template](templates.md)            | `application/xml`     |

With `RAW_JSON`, the endpoint receives the whole notification request, as defined by the [send notification operation](/api/connector-notification-provider#tag/notification-instances-management/POST/v1/notificationProvider/notifications/{uuid}/notify): the event and its data, the resolved recipients and, when the profile enables [event data](../../concept-design/core-components/notification-profile.md#event-data), the object data. Use `JSON` or `XML` with a template when the endpoint expects a format of its own, such as the message format of a chat tool or the API of a ticketing system.

## Use in a notification profile

Select the instance in a [notification profile](../../concept-design/core-components/notification-profile.md) with the recipient type `None`: no recipients are resolved, and the request still carries the whole event. To include data about the event's object, enable [event data](../../concept-design/core-components/notification-profile.md#event-data) on the profile; with `RAW_JSON` it arrives as `objectData`, and a template can render it.
