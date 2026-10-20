---
sidebar_position: 14
---

# Group

`Group` represents the logical grouping of certificates and cryptographic keys based on the common characteristics.

The `Group` may be based on:

- Department that is responsible to manage certificates or keys
- Application that contains the same type of certificates and keys
- Compliance requirements
- Discovery sources
- Certificate and keys metadata

:::info
Multiple `Groups` can be created for easy management and visibility of certificates and keys.
:::

A `Group` can have its own [event triggers](workflow/event.md#supported-events): they run, in addition to the platform's triggers, for the certificates in the group and for comments on its objects, for example to [notify a team](notification-profile.md#send-notifications-on-events) about its own certificates.
