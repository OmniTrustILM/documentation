---
sidebar_position: 20
---

# Notification

`Notification` instance contains information related to external notification technology, i.e., it contains the information of how the external notification should be processed.

The information held by the `Notification` varies depending on the `Kind` of Notification Provider and is defined by the `Connector`.
`Notification Provider` uses `Attributes` to get the data needed to process external notification.

`Notification` has the following parameters:

| Parameter               | Description                                                                             |
|-------------------------|-----------------------------------------------------------------------------------------|
| Name                    | Name of the `Notification` instance                                                     |
| UUID                    | UUID of the `Notification` instance                                                     |
| Description             | Description of the `Notification` instance                                              |
| `Notification Provider` | Identification of `Connector` implementing the `Notification Provider` `Function Group` |
| `Kind`                  | `Kind` of the technology implemented by the `Notification Provider`                     |
| `Attributes`            | `Attributes` defined by `Notification Provider` implementation and the specific `Kind`  |
| `Mapping Attributes`    | List of custom `Attribute` required for the recipient data                              |

## Mapping Attributes

The user data that is used by the `Notification Provider` to process the notification and identify recipients are managed by the platform.
By default, only the data specified in the database for the user will be provided as recipient data to the `Notification Provider`, e.g. e-mail address.

If the `Notification Provider` requires additional data to process the notification, the `Mapping Attributes` can be used to map the data from the platform to the `Attribute` required by the `Notification Provider`.
`Mapping Attributes` are defined by the `Connector` and are specific to the `Kind` of the `Notification Provider`.

## Notification Provider

- `Connector` should implement `Notification Provider` interfaces.
- One `Connector` can serve for more than one `Notification`.
- Inputs for the `Connector` to determine the notification processing are captured and stored in the `Notification`.

For more information, refer to [Notification Provider](../../connectors/provider-interfaces/notification-provider.mdx) description.
