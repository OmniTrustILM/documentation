---
sidebar_position: 5
---

# Credential

`Credential` allows storing the authentication and authorization related information for the `Connector` to use when trying to communicate with an external system and technology.

:::info
Note that `Credential` is only used by the `Connector`. The `Credential` is not used by the platform to authenticate or authorize client or administrative operations.
:::

The platform provides the `Credential Provider API` which can be used to implement custom `Credential Provider`.

Once the `Credential` is stored on the platform, it becomes available for use by every `Connector`.

`Credential` has the following parameters:

| Parameter             | Description                                                                |
|-----------------------|----------------------------------------------------------------------------|
| Name                  | Name of the `Credential`                                                   |
| `Credential Provider` | Name of `Credential Provider` `Connector`.                                 |
| `Kind`                | `Kind` of the `Credential` implemented by the `Connector`.                 |
| `Attributes`          | `Attributes` defined by `Connector`implementation and the specific `Kind`. |
