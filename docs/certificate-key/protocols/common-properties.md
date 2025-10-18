---
sidebar_position: 1
---

# Common Protocol Properties

All supported protocol profiles share a set of common properties that behave consistently across all protocols.

## Default RA Profile

A default **RA Profile** can be assigned to each protocol profile.  
When a default **RA Profile** is selected, the corresponding **Attributes** for certificate issuance and revocation must also be configured, if required.

:::warning
Certificate management **Attributes** defined in a **Protocol Profile** are used during certificate operations and **cannot be modified** by the protocol client.
:::

## Default Certificate Associations

Default certificate associations can be configured within a protocol profile to define how ownership and access are assigned to certificates issued through the protocol.

These associations may include:
- **Owner** — The entity that owns the issued certificates.
- **Group** — The group under which the certificates are managed.
- **Custom attributes** — Additional metadata or policies applied to issued certificates.

Default associations can be set during **profile creation** or modified later when **editing** the protocol profile.
