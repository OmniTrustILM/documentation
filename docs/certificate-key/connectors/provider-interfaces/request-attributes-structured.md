---
sidebar_position: 12
---

# Structured Certificate Request Content

This page describes the wire contract for the typed certificate request content in [Authority Provider v3](./authority-provider-v3.md). It is written for connector developers. For the platform-side model — request attributes, field mappings, and set resolution — see [Request Attribute](../../concept-design/core-components/request-attribute.md) and the contributor page [Request Attributes](../../../contributors/attributes/request-attributes.mdx).

## Two forms on the wire

The certificate identity travels to the connector in one of two forms:

- **Flat fields** — `subjectDn` (a DN string), `subjectAltName` (OpenSSL-convention textual form, e.g. `DNS:foo,IP:1.2.3.4,email:x@y`), and `extensions` (entries of OID, criticality, and a Base64 DER value). They exist on the **register** operation only — issue and renew carry the CSR instead. A v3 connector that does not advertise the `certificateRequestStructured` flag receives the registration identity this way.
- **Structured content** — the typed request content described below. A v3 connector advertising `certificateRequestStructured` receives this instead.

Both forms are rendered from the same content. For a non-structured connector, the platform renders the flat fields from the structured content — and **fails the request closed** when the content cannot be represented flat. When both forms are present on a request, the structured form is authoritative.

This is the v3 authority wire. v2 authority connectors have no structured form and no registration operation: their issue and renew requests carry a Base64 CSR (`request`, with a `format` such as `pkcs10`; renew also carries the existing certificate), and the identity comes from that CSR — never from flat subject fields.

## The Request Content

The request content is polymorphic on certificate type; the only type today is X.509. It carries five lists, all optional:

- **Subject** (`subject`) — ordered subject DN components. Each entry has a type — a short code (for example `CN`) or a dotted-decimal OID, resolved through the [OID registry](../../settings/oid.md) — and a value.
- **Subject Alternative Names** (`subjectAltNames`) — typed SAN entries. Each entry has a type (`dns`, `email`, `ip`, `uri`, `otherName`, `directoryName`, or `registeredId`) and a value. An `otherName` entry additionally carries its OID and a value encoding, because different OtherName OIDs carry differently typed values.
- **Key Usage** (`keyUsage`) — the requested key usage bits, each one of `digitalSignature`, `nonRepudiation`, `keyEncipherment`, `dataEncipherment`, `keyAgreement`, `keyCertSign`, `cRLSign`, `encipherOnly` and `decipherOnly` (bits 0 to 8 of RFC 5280 §4.2.1.3, in that order). The entries are names, not bit numbers. The list carries no criticality: the platform marks the extension critical.
- **Extended Key Usage** (`extendedKeyUsage`) — the requested purposes as dotted-decimal OID strings, for example `1.3.6.1.5.5.7.3.1` for server authentication. The entries are OIDs, not names.
- **Extensions** (`extensions`) — requested X.509 extensions, excluding SAN, Key Usage and Extended Key Usage. Each entry has an OID, a criticality flag, an encoding, and a value — a string whose interpretation is declared by the encoding.

Three invariants hold:

- SAN, Key Usage (`2.5.29.15`) and Extended Key Usage (`2.5.29.37`) are never duplicated as extensions. Each appears only in its own list.
- At least one of the five lists is present and not empty. Content that carries only a key usage list, or only an extended key usage list, is valid.
- The raw CSR remains authoritative for the public key and the proof of possession. The structured content carries the decoded identity intent alongside it.

Example structured content on an issue request:

```json
{
  "requestContent": {
    "certificateType": "X.509",
    "subject": [
      { "type": "CN", "value": "web01.example.com" }
    ],
    "subjectAltNames": [
      { "type": "dns", "value": "web01.example.com" }
    ],
    "keyUsage": ["digitalSignature", "keyEncipherment"],
    "extendedKeyUsage": ["1.3.6.1.5.5.7.3.1", "1.3.6.1.5.5.7.3.2"],
    "extensions": [
      {
        "oid": "1.3.6.1.4.1.99999.1",
        "critical": false,
        "encoding": "UTF8String",
        "value": "web-server-profile"
      }
    ]
  }
}
```

Both Key Usage and Extended Key Usage are requests to the certification authority, not instructions. Whether they are honored depends on the CA technology — see [advisory semantics](../../concept-design/core-components/request-attribute.md#advisory-semantics-toward-the-certification-authority).

## Where it rides

The structured content is an optional part of three v3 operations. Plain issuance from a submitted CSR does not carry it: the connector reads the identity, including Key Usage and Extended Key Usage, from the CSR.

- **Issue** — when present, it is the authoritative source of subject identity and extensions for the issuance. It is present when a registered certificate is completed. Otherwise the identity comes from the submitted CSR.
- **Renew** — when present, it is authoritative for the renewal. It is sent only to a connector that advertises `certificateRequestStructured`. Otherwise the identity derives from the existing certificate (serial number and issuer DN). See [Renew and rekey](#renew-and-rekey).
- **Register** — no CSR exists at registration time. The flat fields are still populated for non-structured connectors and remain the validation anchor. For a non-structured connector, Key Usage and Extended Key Usage are rendered into the flat `extensions` as Base64 DER entries, with Key Usage marked critical.

### Renew and rekey

A renewed or rekeyed certificate keeps the subject DN and the Subject Alternative Names of the certificate it replaces. For a renewal, the platform sends them as structured content to a connector that advertises `certificateRequestStructured`; the extensions of the replaced certificate are the CA's and are not carried over.

- When the operator supplies a CSR, the content is taken from that CSR instead, including the extensions it requests.
- The platform sends no structured content, and the connector reads the CSR, when the subject has a multi-valued RDN, a SAN of a type the platform cannot re-request, or an extension value it cannot represent.
- A rekey without a CSR is built by the platform from the replaced certificate. When its identity cannot be carried over, the request is refused with a validation error instead of being issued with a changed identity.

## Identity override

Some CA technologies can apply a platform-supplied identity when issuing from a forwarded CSR. The `certificateIdentityOverride` capability flag advertises this.

The platform never strips or re-signs a client CSR. The connector receives the CSR intact, plus the authoritative identity, and applies the identity per its CA technology — for example an EJBCA end-entity override.

This matters when completing a pre-registration. When the connector advertises both `certificateRequestStructured` and `certificateIdentityOverride`, the platform passes the registered identity alongside the operator's CSR — so the CA issues with the identity fixed at registration time, whatever the CSR says.

## Registration wire

The register operation pre-registers a certificate's identity at the upstream CA before any CSR exists. The request carries the identity — structured or flat, per the capability flag — plus the registration attributes. The connector responds in one of two ways:

- **`200`** — registered synchronously. The response carries an end-entity reference in `meta`. No certificate is produced.
- **`202`** — registration accepted, completion is asynchronous. The response carries a tracking handle in `meta`. The platform polls for completion when the connector advertises `certificateStatusPolling`.
