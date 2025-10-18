---
sidebar_position: 35
---

# Object Identifiers (OIDs)

Object Identifiers (`OIDs`) are a standardized mechanism for uniquely naming any object, concept, or entity using a globally unambiguous and persistent identifier. OIDs follow a hierarchical tree structure, where each node is represented by a numerical value separated by dots (for example, `1.2.840.113549`).

In **X.509 certificates**, OIDs are widely used to identify various objects and attributes. Since OIDs are numerical, they often need to be translated into human-readable names for easier interpretation.

The most commonly used OIDs are typically predefined as **System OIDs**. To extend the repository, additional **Custom OIDs** can be registered to define new identifiers beyond the default set. These custom definitions allow the translation of OIDs into human-readable names outside of the predefined System OIDs.

Custom OIDs can be managed using the [Custom OID Management API](/api/core-other#tag/Custom-OID-Management).
