---
sidebar_position: 9
---

# Entity

An `Entity` represents the end-user that actually uses the certificate and associated private key.

As an example, `Entity` can be:
- Server
- Network appliance, like router, load balancer
- Active Directory
- IoT device

## Characteristics

`Entity` provides access to the end-user that can be further managed by its [`Locations`](location.md).

The `Entity` is always managed by specific implementation of [`Entity Provider`](../../connectors/provider-interfaces/entity-provider.md) that is connected with the platform.
Based on that, we can perform operations with `Entity`, such as:
- Add, edit, or remove `Entities`
- Manage state and [`Locations`](location.md)
