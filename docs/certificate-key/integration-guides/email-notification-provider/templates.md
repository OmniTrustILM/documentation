---
sidebar_position: 3
---

# Templates

The subject and the content of the e-mail are [FreeMarker](https://freemarker.apache.org/docs/) templates, rendered for every notification. A template that cannot be rendered fails the notification, so write every expression so that it survives missing data.

## Template data

The template sees the whole notification request, as defined by the [send notification operation](/api/connector-notification-provider#tag/notification-instances-management/POST/v1/notificationProvider/notifications/{uuid}/notify). Most templates use:

- `notificationData`, the event's own data. Each event defines its fields, see the [supported events](../../concept-design/core-components/workflow/event.md#supported-events).
- `objectData`, data about the event's subject, when the notification profile enables [event data](../../concept-design/core-components/notification-profile.md#event-data).
- `event` and `resource`, the code of the event and the resource of its object.

`objectData` always names its `subject`. Each other part is present only when its category is enabled and has data:

| Part               | Content                                                                                                    |
|--------------------|------------------------------------------------------------------------------------------------------------|
| `subject`          | The object the data describes, with its `resource`, `uuid` and `name`                                       |
| `customAttributes` | Custom attributes keyed by name, each with its `label`, `contentType` and list of `values`                  |
| `metadata`         | Metadata groups, each with its `connectorName`, `sourceObjectType` and `attributes` keyed by name           |
| `associations`     | Associated objects, each with its `resource` (`users` for the owner, `groups`, `raProfiles`), `uuid` and `name` |
| `content`          | The content of the object, with its `format`, such as `X509_DER_BASE64`, and its `data`                     |

## Escaping

Values inserted into the content template are HTML-escaped, so that text such as a comment body arrives as text, never as markup. Escaping makes a value safe in element text and in a quoted value of an inert attribute, such as `title` or `alt`, and nowhere else: not in an unquoted attribute, an event handler, a `<script>` or `<style>` element, or a URL attribute such as `href`. To build a link, write its scheme and host in the template and insert only a value that cannot change the target, such as a UUID.

A value that has to stay markup opts out of escaping with `?no_esc`; use it only for markup you trust. The subject is plain text, and values are inserted into it as they are.

A content template that uses `?html` is refused when the instance is saved, and a notification that reaches one fails. Remove `?html`, and the value is escaped automatically.

## Safe access

`objectData` is present only when the profile enables event data, and any part of it can be missing. Event fields can be missing too, such as the deadline of an approval whose approval profile sets none. Put a value in parentheses and give it a default with `!`, so that a missing step anywhere in the path renders the default:

```
Department: ${(objectData.customAttributes.department.values[0])!"not set"}
```

Apply a built-in such as `?filter` to the defaulted value in parentheses, not to the default alone:

```
<#assign owners = ((objectData.associations)![])?filter(a -> a.resource == "users")>
Owner: <#if owners?has_content>${owners[0].name}<#else>none</#if>
```

## Example

This content template for the **Approval requested** event renders with or without event data, and for an approval without a deadline:

```html
<p>${(notificationData.creatorUsername)!"A user"} asks for approval to ${(notificationData.resourceAction)!"act"} on ${(objectData.subject.name)!"an object"}.</p>
<p>Department: ${(objectData.customAttributes.department.values[0])!"not set"}</p>
<p>Decide by: ${(notificationData.expiryAt)!"no deadline"}</p>
```
