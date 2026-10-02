---
sidebar_position: 13
---

# Request Attribute

A request attribute defines one value the requester supplies when asking for a certificate. It is a regular platform Data Attribute whose definition carries a **field mapping** — a declaration of which certificate request field the value lands in. The presence of the mapping is the sole marker: an attribute without a mapping behaves exactly like any other attribute, so existing attribute definitions elsewhere in the platform keep working unchanged.

Request attributes build on the platform attribute engine — see the [attributes overview](../architecture/attributes/overview.md). They are unrelated to [Custom Attributes](../../settings/custom-attributes.md): a custom attribute attaches extra information to a platform object, while a request attribute defines the content of the certificate itself.

## Why request attributes

Certificate requests are technical. They speak in subject components, SAN entries, and extension OIDs. Request attributes let you offer a friendly, policy-controlled request form instead — the requester fills in "Server FQDN" rather than composing a Common Name, and the platform places the value where it belongs.

The same definitions apply everywhere. They work the same whether the platform builds the request, a client supplies its own CSR, or the certificate is pre-registered before any key exists.

## Mapping targets

A field mapping declares one or more target fields in the certificate. Definitions with string or text content can carry a mapping — the mapping projects the attribute's textual value into the certificate field:

- **RDN (subject)** — a component of the certificate subject name. The RDN is identified by its code (for example `CN`, matched case-insensitively) or its dotted-decimal OID, resolved through the [OID registry](../../settings/oid.md). A definition whose RDN code is not known to the registry is rejected when saved; a well-formed dotted-decimal OID is accepted without any registry lookup. Subject components render in the order their definitions appear in the set, and the same RDN type can appear more than once (multivalued subjects).
- **Subject Alternative Name** — a typed SAN entry, such as a DNS name or an email address. Although SAN is technically an X.509 extension, it is mapped only through this dedicated target — never as a certificate-extension mapping. The platform composes the SAN extension from the typed entries, so a request cannot carry conflicting SAN values.
- **Key Usage** — the Key Usage extension (`2.5.29.15`). Like SAN, it is mapped only through this dedicated target, never as a certificate-extension mapping. The attribute is a list of key usage bits, and its predefined content is the permitted set.
- **Extended Key Usage** — the Extended Key Usage extension (`2.5.29.37`). Like SAN, it is mapped only through this dedicated target. The attribute is a list of purposes registered in the [OID registry](../../settings/oid.md), and its predefined content is the permitted set.
- **Certificate extension** — any other X.509 extension, identified by its OID from the [OID registry](../../settings/oid.md). The OID must be known to the `Certificate Extension` category before an attribute can map to it — a definition referencing an unknown OID is rejected when saved. The [common standards-track extensions](../../settings/oid.md#built-in-certificate-extensions) are built in and need no registration; anything else must be registered as a Custom OID first. The registry entry provides the default criticality and the value encoding used to turn the string value into the extension value. For a client-supplied CSR, mapping an extension means the requester's extension is *accepted* — not that the platform sets its value. See [Extension values](#extension-values) for how a platform-side value is written. A new generic mapping for Key Usage or Extended Key Usage is rejected when saved; definitions saved before the typed targets existed keep working.

One attribute can map to several fields at once. A single "Server FQDN" value can land in both the subject `CN` and a `dNSName` SAN entry. Within a single definition, a given certificate extension may be mapped only once — X.509 permits each extension to appear at most once in a certificate. Whether two *different* definitions collide on the same field is checked at request time, not when the definition is saved.

### Extension values

The value of a generic `Certificate extension` mapping is written in one of two ways, depending on whether the extension's OID has an [ASN.1 module](../../settings/oid.md#asn1-modules-and-jer-values) registered:

- **With a module** — the value can be written in JER, the JSON encoding of ASN.1 (ITU-T X.697), naming the members of the module's type. The platform checks a JER value against the module and encodes it as DER. A value given as Base64-encoded DER is still accepted.
- **Without a module** — the value is Base64-encoded DER, which the platform embeds as it is. It cannot be checked, because the platform has no description of it.

An attribute that carries a value for an OID with no module must give it as Base64-encoded DER; a value written as JER is refused with a message saying that a module is required.

An attribute mapped to an extension can also carry a **JSON Schema** constraint, which applies policy to a JER value on top of what the module already guarantees — for example, to limit a value to the tiers a profile may request. The constraint reads the value as JSON, so it makes sense for values written as JER and rejects Base64-encoded DER. See [Constraints](../../../contributors/attributes/constraints.mdx) for how it is defined.

:::note[Value checks apply to the values you submit]
The module and the JSON Schema constraint check the values supplied for the attribute when a certificate is requested through the platform. The values of generic extensions found in a CSR uploaded by a client are not checked: only their presence, and whether the set allows them, is enforced. Key Usage and Extended Key Usage are the exception, as they are checked against their permitted set.
:::

### Advisory semantics toward the certification authority

A mapping describes what the platform asks for. The certification authority decides what it issues. A requested Key Usage or Extended Key Usage is honored only when the CA allows the request to set it — for example, EJBCA needs "Allow Extension Override" on the certificate profile, and an ADCS template must take the extension from the request rather than from the template itself. A mapping is therefore not a guarantee that the issued certificate carries the value.

## Value sources

Orthogonal to the mapping, a definition can declare how the requester's value is obtained:

- **Free input** — the requester types any value.
- **Static list** — the requester picks from a fixed list of values defined with the attribute.

## Where request-attribute sets come from

Request-attribute definitions have three sources:

- the **static set** authored on an [`RA Profile`](./ra-profile.md)
- the **connector set** — the request attributes the authority connector declares for its own certificate service
- the **platform default set** managed in [platform settings](../../settings/request-attributes.md)

Both the static set and the platform default set are authored in the platform, and the platform validates them on save: every definition must declare a field mapping with at least one target field. An unmapped definition would never contribute to the certificate request, so it is rejected at authoring time rather than carried as dead weight.

### Merge mode

The **merge mode** of an `RA Profile` decides how its static set and the connector set combine into the effective set:

| Merge mode       | Effective set                                                                                                                                              |
|------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Static only`    | Only the static set of the profile. Connector-supplied attributes are ignored. This is the default                                                         |
| `Connector only` | Only the set supplied by the connector. The static set is ignored                                                                                          |
| `Merge`          | The union of both. When both define the same attribute, matched by UUID or by name, the connector's definition wins and the static set adds only what the connector did not supply |

The platform default set is not a merge mode. It is the fallback: when the resulting set is empty, the platform default set applies. A profile that authored a non-empty static set under `Static only` therefore never sees the platform default.

A connector that supplies no request attributes — it does not implement the operation, answers that it is not supported, or the authority is a v2 connector — contributes an empty set. This is not an error: `Merge` then yields the static set, and `Connector only` yields the platform default set.

### Value-source bindings

A **value-source binding** lets an `RA Profile` attach a [value source](#value-sources) to an attribute supplied by the connector, without redefining the attribute. A binding names the attribute by UUID or by name, and the value source to apply — free input or a static list. It is applied after merging and overrides any value source the connector declared for that attribute. The binding follows the attribute by name if the connector changes its UUID. Each attribute can be targeted by at most one binding.

Bindings are authored together with the profile's request attributes. The platform default set is edited without merge mode or bindings.

## Where the resolved set is used

- **Building a platform-side request** — when a certificate is issued with an existing platform key, the attribute values are projected into the subject, SAN entries, Key Usage, Extended Key Usage and extensions of the request the platform builds and signs.
- **Validating an external CSR** — a client-supplied CSR is checked against the resolved set, in strict or lenient mode. See [External CSR validation](./ra-profile.md#external-csr-validation).
- **Telling the connector what is requested** — a connector that advertises structured request content receives the resolved identity as typed lists. See [Structured Certificate Request Content](../../connectors/provider-interfaces/request-attributes-structured.md).
- **Pre-registering a certificate** — the identity of a certificate registered before any key exists can be given as request-attribute values.
- **Protocol enrollment** — CSRs enrolled over protocols such as ACME, CMP, and SCEP are validated against the resolved set of the protocol's `RA Profile`.
