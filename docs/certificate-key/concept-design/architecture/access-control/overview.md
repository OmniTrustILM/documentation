---
sidebar_position: 1
---

# Overview

**Access control is a fundamental to every platform.**

CZERTAINLY decouples the identification, authentication, and authorization process and therefore provides flexibility in terms of configuring access control rules.

The following steps are generally applied when the user should be identified, authenticated, and authorized:
1. The user is authenticated using external authentication system. The identification of authenticated user is forwarded to the platform.
2. CZERTAINLY Auth Service validates the identification of the user and searches for the user in the database.
3. When the user is found, internal authorization token is produced containing all permissions that are assigned to the user according to the role definition.
4. The authorization token is used by internal services to evaluate authorization of the user to actions and related objects using [OPA](https://www.openpolicyagent.org/).

The access control consists of the following parts:

| Access Control Part                                           | Short description                             |
|---------------------------------------------------------------|-----------------------------------------------|
| [Externalized Authentication](externalized-authentication.md) | External authentication system support        |
| [Identification](identification.md)                           | Supported identification options              |
| [Authorization](authorization.md)                             | Authorization policies and evaluation process |
| [Users](users.md)                                             | User management                               |
| [Roles and Permissions](roles-permissions.md)                 | Management of roles and permissions           |
