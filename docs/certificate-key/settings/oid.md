---
sidebar_position: 35
---

# Object Identifiers (OIDs)

Object Identifiers (`OIDs`) are a standardized mechanism for uniquely naming any object, concept, or entity using a globally unambiguous and persistent identifier. OIDs follow a hierarchical tree structure, where each node is represented by a numerical value separated by dots (for example, `1.2.840.113549`).

In **X.509 certificates**, OIDs are widely used to identify various objects and attributes. Since OIDs are numerical, they often need to be translated into human-readable names for easier interpretation.

The commonly used RDN attribute types, extended-key-usage purposes, and certificate extensions are predefined as **System OIDs** (see [System OIDs](#system-oids)). To extend the repository, additional **Custom OIDs** can be registered to define new identifiers beyond the default set. These custom definitions allow the translation of OIDs into human-readable names outside of the predefined System OIDs.

Custom OIDs can be managed using the [Custom OID Management API](/api/core-other#tag/custom-oid-management).

## Categories

Every OID entry belongs to one of four categories:

- **RDN Attribute Type** — an attribute type that can appear in a Distinguished Name. Each entry defines a short code (for example `CN`) and optional alternative codes. System and custom RDN entries together form the list that [certificate request attributes](../concept-design/core-components/request-attribute.md) offer in their RDN dropdown.
- **Extended Key Usage** — a key purpose that can appear in the Extended Key Usage extension of a certificate. The registered purposes are what an Extended Key Usage [request attribute](../concept-design/core-components/request-attribute.md#mapping-targets) can offer.
- **Certificate Extension** — an X.509 certificate extension with a default criticality and a typed value encoding. The common standards-track extensions are [built in](#built-in-certificate-extensions); anything beyond them is registered as a [custom certificate extension](#custom-certificate-extensions).
- **Generic** — a general-purpose identifier that does not fit any other category.

## Custom certificate extensions

Registering an OID in the `Certificate Extension` category makes that extension available as a mapping target for [certificate request attributes](../concept-design/core-components/request-attribute.md). Key Usage (`2.5.29.15`) and Extended Key Usage (`2.5.29.37`) are not mapped this way: they have their own mapping targets, and a new generic mapping for either is rejected. When a request attribute maps to the extension, the registry entry tells the platform how the attribute's value is placed into the certificate request.

A `Certificate Extension` entry has two properties, plus an optional [ASN.1 module](#asn1-modules-and-jer-values) for the `DER` encoding:

- **Default Critical** — whether the extension is marked critical by default when placed in a certificate.
- **Value Encoding** — how the attribute's string value is encoded into the extension's DER value.

The following encodings are available:

- `UTF8String`, `IA5String`, `PrintableString`, `OctetString` — you supply a plain string. The platform wraps it in the matching ASN.1 type and DER-encodes it.
- `DER` — you supply the complete DER value, Base64-encoded. The platform embeds it as-is.
- `BitString` — see the warning below.

:::warning[BitString encoding]
`BitString` is currently not supported for certificate building. A certificate request that uses an extension with this encoding fails. Supply the value as `DER` instead.
:::

Keep the following rules in mind:

- Each extension OID may appear only once in a certificate request.
- The Subject Alternative Name cannot be mapped as extension OID `2.5.29.17`. A definition that tries is rejected when saved, pointing at the dedicated SAN mapping target instead.
- Registration is required for mapping: a request attribute definition that references an unregistered extension OID is rejected when saved. The [built-in certificate extensions](#built-in-certificate-extensions) already count as registered — they need no Custom OID entry, and one cannot be created for them. Should a custom registry entry be deleted afterwards, requests still work — the extension then falls back to non-critical and its value is treated as Base64-encoded DER.

### Windows / ADCS enrolment

Windows autoenrolment and NDES/SCEP clients emit the Microsoft certificate-template extensions `1.3.6.1.4.1.311.20.2` (Certificate Template Name) and `1.3.6.1.4.1.311.21.7` (Certificate Template Information). Being vendor extensions, they are not built in — register them as Custom OIDs (non-critical, `DER` encoding) so requests carrying them pass strict validation.

Note the value is advisory in this setup: the ADCS connector injects the certificate template itself, as a request attribute derived from the RA profile — so a request-attribute mapping to these OIDs *admits* the extension rather than controlling which template is used.

### ASN.1 modules and JER values

An extension registered with the `DER` encoding can also carry an **ASN.1 module**: a description of the extension's value type. With a module, the platform knows the structure of the value, and a value can be written in **JER** — the JSON encoding of ASN.1 defined by ITU-T X.697 — instead of Base64-encoded DER. The platform checks the JER value against the module and encodes it as DER.

The module is written once, by whoever knows the extension. It is optional:

- **Without a module**, the value is Base64-encoded DER, which the platform embeds as it is and cannot check. A value written as JER for such an OID is refused with a message saying that a module is required.
- **With a module**, the value may be written as JER or still given as Base64-encoded DER. A value is read as JER when it starts with `{`, `[`, `"` or `-`, and also when it is a bare `true`, `false` or `null`. A value of digits only is read as Base64-encoded DER when it decodes to one complete DER value, and as a JER number otherwise. Anything else is read as Base64-encoded DER.

Core also ships a module for each of its built-in standard extensions (see [Shipped modules](#shipped-modules)). Key Usage and Extended Key Usage ship none, because they are set through their own mapping targets.

#### Writing a module

The module is entered in the **Value Schema (ASN.1 Module)** field of the custom OID form. The field is shown when the category is `Certificate Extension` and the `Value Encoding` is `DER`. The type of the extension's value is the **first type** defined in the module.

```
Demo DEFINITIONS IMPLICIT TAGS ::= BEGIN
  ServiceEntitlement ::= SEQUENCE {
    serviceId  UTF8String (SIZE (5..32)),
    tier       INTEGER (1..3)
  }
END
```

A value for this module, written in JER:

```json
{ "serviceId": "svc-billing", "tier": 1 }
```

The module may use a subset of ASN.1 (ITU-T X.680):

- the constructed types `SEQUENCE`, `SET`, `SEQUENCE OF`, `SET OF` and `CHOICE`;
- the types `BOOLEAN`, `INTEGER`, `NULL`, `OCTET STRING`, `BIT STRING`, `OBJECT IDENTIFIER`, `UTF8String`, `IA5String`, `PrintableString` and `GeneralizedTime`;
- context-specific tags `[n]`, with `EXPLICIT` or `IMPLICIT`, and `IMPLICIT TAGS` or `EXPLICIT TAGS` in the header (`EXPLICIT TAGS` when none is given);
- `OPTIONAL`, and `DEFAULT` for `BOOLEAN` and `INTEGER` members;
- `SIZE` and value-range constraints, and `WITH COMPONENTS` to require or forbid members;
- `ANY`, written in JER as the hex of its DER;
- references to types the module defines, and `--` comments.

Not supported: `AUTOMATIC TAGS`, `IMPORTS` and `EXPORTS`, extension markers (`...`), value assignments, recursive types, named numbers and named bits, and the other ASN.1 types, such as `UTCTime`, `ENUMERATED`, `REAL`, `BMPString` or `VisibleString`.

#### Writing a value in JER

- A `SEQUENCE` or `SET` is a JSON object naming its members. An optional member that is absent is left out. A member written with its `DEFAULT` value is accepted and omitted from the encoding, as DER requires.
- A `CHOICE` is an object with exactly one key, the name of the chosen alternative.
- `SEQUENCE OF` and `SET OF` are arrays.
- `OCTET STRING` is a hex string. `BIT STRING` is a hex string when its size is fixed, otherwise an object with `value` as hex and `length` in bits. `OBJECT IDENTIFIER` is a dotted string. `GeneralizedTime` is in the DER form `YYYYMMDDHHMMSSZ`.

#### What the platform refuses

The module is read when the Custom OID is created or edited, and the form shows the reason when it is refused. The messages start with "The extension's ASN.1 module" and name the construct, for example:

- it uses `AUTOMATIC TAGS`, `IMPORTS`, an extension marker or an unsupported type;
- it defines a name twice, or a type refers to itself;
- it writes a `SIZE` or a range the type cannot carry, or a range that admits no value;
- it gives a `DEFAULT` that is not a value of its type;
- it tags a type but does not define it, so its tagging cannot be determined — define the type in the module, or tag it `EXPLICIT` or `IMPLICIT`;
- it cannot be decoded unambiguously, for example an optional member followed by a member with the same tag — tag one of them.

A module is accepted only together with the `DER` value encoding.

#### Editing and removing

A module can be changed or removed by editing the Custom OID. The change takes effect for the values checked afterwards. Existing request attributes that map the extension are not re-checked when the module changes or when the OID is deleted; they are checked the next time they are used. A mapping to an OID that has been deleted is refused when the attribute is saved.

A custom entry takes precedence while it exists: a custom entry without a module means the extension is undescribed, even for an OID for which Core ships a module. System OIDs cannot be registered as Custom OIDs, so this only matters for entries that were registered before the platform introduced the built-in.

#### Shipped modules

Core ships ASN.1 modules for the built-in standard extensions Subject Directory Attributes (`2.5.29.9`), Subject Key Identifier (`2.5.29.14`), Private Key Usage Period (`2.5.29.16`), Basic Constraints (`2.5.29.19`), Name Constraints (`2.5.29.30`) and TLS Feature (`1.3.6.1.5.5.7.1.24`). You can read the module of a system OID on its detail.

Where the RFC states a rule in prose that its ASN.1 module does not express, the shipped module follows the RFC text, so a module may differ from the one in the RFC:

- **Name Constraints** declares no `minimum` and no `maximum`, as RFC 5280 §4.2.1.10 requires. Its `iPAddress` is `SIZE (8 | 32)`, an address followed by a mask. At least one of `permittedSubtrees` and `excludedSubtrees` must be present.
- **Basic Constraints** allows `pathLenConstraint` only when `cA` is true.
- **Private Key Usage Period** requires at least one of `notBefore` and `notAfter`.

TLS Feature follows RFC 7633 as written: its feature numbers are unbounded integers.

To register a certificate extension in the UI:

1. Go to `Settings` → `Custom OIDs` and open `Create Custom OID`.
2. Enter the `OID` in dot-separated numeric format, starting with 0, 1, or 2.
3. Enter the `Display Name` and, optionally, a `Description`.
4. Set `Select Category` to `Certificate Extension`.
5. Choose the `Default Critical` and `Value Encoding` properties.

The `OID` and category cannot be changed after creation.

## System OIDs

The built-in **System OIDs** cover the common RDN attribute types (such as `CN`, `O`, `OU`, or `C`), the common extended-key-usage purposes (such as server authentication, client authentication, or code signing), and the common standards-track [certificate extensions](#built-in-certificate-extensions).

The set is defined by the [`SystemOid`](https://github.com/OmniTrustILM/interfaces/blob/main/src/main/java/com/otilm/api/model/core/oid/SystemOid.java) enum. For a running platform, retrieve it with the [Custom OID Management API](/api/core-other#tag/custom-oid-management): `GET /v1/oids/system`, optionally filtered by category — for example `?category=certificateExtension` or `?category=rdnAttributeType`. RDN entries come back with their code and alternative codes, certificate extensions with their default criticality and value encoding.

System OIDs are reserved: creating a Custom OID with one of these values is rejected. A custom entry that already existed before the built-in was introduced (for example, registered before a platform upgrade) **shadows** the built-in — the custom entry wins and the built-in defaults do not apply; the platform logs a recurring warning for such entries. Delete the custom entry to fall back to the built-in definition.

Extensions that appear only in *issued* certificates (set by the CA, never requested) and vendor-specific extensions are deliberately not built in; the latter remain registrable as [Custom certificate extensions](#custom-certificate-extensions).

### Built-in certificate extensions

The extensions a requester plausibly places in a CSR are built in — Extended Key Usage, Key Usage, and Basic Constraints among them. No Custom OID entry is needed, and none can be created for them. Basic Constraints and the other standard extensions are available as generic extension mapping targets straight away; Key Usage and Extended Key Usage are mapped through their own [targets](../concept-design/core-components/request-attribute.md#mapping-targets). The generic extensions carry the `DER` value encoding and, where Core ships one, an [ASN.1 module](#shipped-modules), so a platform-side value is written in JER or supplied as Base64-encoded DER.

Subject Alternative Name (`2.5.29.17`) is deliberately absent — it is reached through its own mapping target, never as a certificate extension.

Mapping one of these does not make the platform set the extension. For a client-supplied CSR it *admits* the requester's extension, which is what lets a CSR carrying, say, Basic Constraints pass [strict validation](../concept-design/core-components/ra-profile.md#external-csr-validation).

### RDN codes

Every RDN entry defines one code and, optionally, alternative codes. Codes and alternative codes are matched **case-insensitively** everywhere they are consumed — in a request-attribute mapping and when parsing a Distinguished Name — so `postalcode` and `PostalCode` reach the same entry. The registry's own spelling of the code is what the platform emits when it renders a Distinguished Name for display. The normalized form of a DN uses dotted OIDs instead of codes, so comparison and search are unaffected by codes and their casing.

:::warning[`SN` is Surname, not Serial Number]
Following RFC 4519, `SN` is the code for Surname (`2.5.4.4`). The subject serial number is `2.5.4.5`, whose code is `SERIALNUMBER`. Mapping a request attribute to `SN` when you meant a device serial number silently places the value in the wrong RDN.
:::

### RDN code collisions

Codes and alternative codes share a single flat namespace across the whole RDN category — one token may be claimed by only one OID:

- Creating or editing a Custom OID whose code or alternative code is already in use — by a built-in entry or by another custom entry — is rejected (`Code X is already used`). The check is case-insensitive.
- A collision that predates the built-in — a custom entry registered before the platform introduced the same code — resolves deterministically in favour of the **custom** entry, so the built-in loses its code. The platform logs a recurring warning naming every claimant OID and the one it resolved to. Rename the custom entry's code or alternative code to remove the ambiguity.
