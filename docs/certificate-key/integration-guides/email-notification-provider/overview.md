---
sidebar_position: 1
---

# Overview

This document outlines the steps necessary to deliver the platform's external notifications as e-mails through the Email Notification Provider.

## Email Notification Provider

The **Email Notification Provider** is the [`Connector`](../../concept-design/architecture/connector.md) that implements the [Notification Provider](../../connectors/provider-interfaces/notification-provider.mdx) interface for e-mail delivery:

| Function Group          | Kind    |
|-------------------------|---------|
| `Notification Provider` | `EMAIL` |

When an [event](../../concept-design/core-components/workflow/event.md) triggers a [notification profile](../../concept-design/core-components/notification-profile.md) that uses an instance of this connector, `Core` resolves the recipients and sends the notification request to the connector. The connector renders the subject and content of the e-mail from the templates of the instance, and sends it through its SMTP server to the addresses of the recipients.

## Prerequisites

Before you start, make sure that:

- The Email Notification Provider is deployed with access to an SMTP server, and registered as a `Connector` in the platform. Deploying the connector is part of the installation: with the Helm chart, set `emailNotificationProvider.enabled` in the [chart values](../../installation-guide/deployment/deployment-helm/configurable-parameters.md#local-parameters); with the operator, deploy it with a [Connector resource](../../installation-guide/deployment/deployment-operator/custom-resources/connector.md).
- To include [event data](../../concept-design/core-components/notification-profile.md#event-data) in the e-mails, the connector is version 1.3.0 or later.
- The recipients can be reached by e-mail. Groups and roles need an e-mail address of their own, a user needs one or a [custom attribute](../../settings/custom-attributes.md) that holds one, and an Object recipient needs that custom attribute on the object. See [mapping attributes](configure-instance.md#mapping-attributes).

## Integration

The following steps are required to deliver notifications by e-mail:

| #     | Reference                                                                                                                 | Short description                                                                                             |
|-------|---------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| **1** | [Configure Notification Instance](./configure-instance.md)                                                                | Create the notification instance with the sender address and the templates                                    |
| **2** | [Templates](./templates.md)                                                                                               | Write the subject and the content of the e-mails                                                              |
| **3** | [Send Notifications on Events](../../concept-design/core-components/notification-profile.md#send-notifications-on-events) | Use the instance in a notification profile, and send the profile from a trigger on the events to notify about |
