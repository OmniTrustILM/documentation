---
sidebar_position: 3
---

# Templates

With the content types `JSON` and `XML`, the request body is a [FreeMarker](https://freemarker.apache.org/docs/) template, rendered for every notification. A template that cannot be rendered fails the notification.

The template sees the same [data](../email-notification-provider/templates.md#template-data) as an e-mail template, and the same [safe access](../email-notification-provider/templates.md#safe-access) applies. Unlike e-mail content, nothing is escaped automatically, so escape every value for the format of the body.

## Building a JSON body

These rules keep the rendered body valid JSON:

- Escape every inserted string with `?json_string`, applied after the default, to the defaulted value in parentheses: `${((objectData.subject.name)!"")?json_string}`. Names and attribute values can contain quotes or backslashes.
- Insert numbers with `?c`, not `?string`: `?string` formats a number for the locale, so `8443` becomes `8,443`.

For example, this body stays valid JSON whether the profile enables event data or not:

```
{
  "event": "${event?json_string}",
  "certificate": "${((notificationData.subjectDn)!"")?json_string}",
  "expires": "${((notificationData.expiresAt)!"")?json_string}",
  "department": "${((objectData.customAttributes.department.values[0])!"")?json_string}"
}
```

:::tip
When the endpoint can read the platform's own format, use the `RAW_JSON` [content type](configure-instance.md#content-types) instead: there is no template to maintain, and new fields arrive automatically.
:::

## Building an XML body

Escape every inserted string with `?xml`:

```
<subject>${((objectData.subject.name)!"")?xml}</subject>
```

A value such as `shop "A" & <B>` then renders as `shop &quot;A&quot; &amp; &lt;B&gt;`, and the document stays well-formed.
