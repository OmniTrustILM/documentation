---
sidebar_position: 20
---

# Events

The `Events` allows users to seamlessly configure and manage events that occur within the platform, enabling a robust workflow automation system. Events can be triggered by changes in the lifecycle of objects, such as state changes or performed actions. They can also be part of scheduled monitoring for objects that require user attention.

For more details about the events, refer to the [Events](../concept-design/core-components/workflow/event.md) section in architecture documentation.

## Managing `Events` in settings

Within the settings section, users can configure associated triggers for each event. This configuration allows users to define how the platform should respond when specific events occur. By associating triggers with events, users can automate actions or notify users about significant occurrences.

### `Notification` instances

The platform provides ability to create, edit, and delete `Notification` instances.
Notification instances defines external channels through which notifications are delivered, such as email, webhooks, or other external systems. Each instance can be configured with specific attributes.

For more details about the notification instances, refer to the [Notification Instances](../concept-design/architecture/notifications.md) section in architecture documentation.
