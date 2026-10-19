---
sidebar_position: 1
---

# Overview

This document outlines the steps necessary to deliver the platform's external notifications to an HTTP endpoint through the Webhook Notification Provider, for example to a ticketing system, a chat tool or an automation pipeline.

## Webhook Notification Provider

The **Webhook Notification Provider** is the [`Connector`](../../concept-design/architecture/connector.md) that implements the [Notification Provider](../../connectors/provider-interfaces/notification-provider.mdx) interface for HTTP delivery:

| Function Group          | Kind      |
|-------------------------|-----------|
| `Notification Provider` | `WEBHOOK` |

When an [event](../../concept-design/core-components/workflow/event.md) triggers a [notification profile](../../concept-design/core-components/notification-profile.md) that uses an instance of this connector, the connector sends an HTTP `POST` request to the URL of the instance. The body is the whole notification request as JSON, or is rendered from a [template](templates.md), see [content types](configure-instance.md#content-types).

Every request carries these headers:

| Header                | Value                                                          |
|-----------------------|----------------------------------------------------------------|
| `Content-Type`        | According to the content type of the instance                  |
| `X-Webhook-Timestamp` | Time of the request in milliseconds since the epoch            |
| `X-Webhook-Nonce`     | Random Base64-encoded value, unique per request                |

Delivery is not confirmed to the platform: the connector accepts the notification before the request completes, and a request that fails or is answered with an error is logged by the connector and not retried.

The webhook posts to its URL whatever the recipients of the notification are, so profiles that use it typically have the recipient type `None`, see [notification recipients](../../concept-design/architecture/notifications.md#notification-recipients). Recipients that a profile does resolve are part of the delivered request.

## Prerequisites

Before you start, make sure that:

- The Webhook Notification Provider is deployed and registered as a `Connector` in the platform. Deploying the connector is part of the installation: with the Helm chart, set `webhookNotificationProvider.enabled` in the [chart values](../../installation-guide/deployment/deployment-helm/configurable-parameters.md#local-parameters); with the operator, deploy it with a [Connector resource](../../installation-guide/deployment/deployment-operator/custom-resources/connector.md).
- To include [event data](../../concept-design/core-components/notification-profile.md#event-data) in the requests, the connector is version 1.1.0 or later.
- The receiving endpoint is reachable from the connector and accepts `POST` requests with the content type you choose.

## Integration

The following steps are required to deliver notifications to an HTTP endpoint:

| #     | Reference                                                                            | Short description                                                                |
|-------|--------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| **1** | [Configure Notification Instance](./configure-instance.md)                           | Create the notification instance with the URL and the content type               |
| **2** | [Templates](./templates.md)                                                          | Write the request body, for the `JSON` and `XML` content types                   |
| **3** | [Notification Profile](../../concept-design/core-components/notification-profile.md) | Use the instance in a notification profile and associate the profile with events |
