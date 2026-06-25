---
sidebar_position: 8
---

# Timestamp Formatter Connector

The Timestamp Formatter Connector is the Signature Formatter Connector implementation for RFC 3161 Time-Stamp Tokens. It is a stateless HTTP service that handles all ASN.1 construction work required to produce a verifiable `TimeStampToken` in the managed static-key signing flow. The token is a CMS `SignedData` structure (RFC 5652) whose encapsulated content is the `TSTInfo` defined by RFC 3161, and whose `SignedAttributes` include the `SigningCertificateV2` attribute (carrying `ESSCertIDv2`, RFC 5816).

The connector holds no keys and performs no cryptographic signing itself. Its sole responsibility is assembling the correct DER structures before and after ILM Core signs with the profile's managed key.

For the architecture context, including where the Formatter Connector fits among ILM Core, TQM, and the cryptographic token, see the [architecture diagram in the Timestamping Overview](./overview.md#architecture-at-a-glance).

---

## Role in the timestamping flow

When ILM Core issues a timestamp token for a managed static-key signing profile, it calls the Formatter Connector at two points in the flow (see [Timestamping Request Flow](./timestamping-flow.md) for the full sequence): first to build the DER structures to be signed (`formatDtbs`), then — after ILM Core has signed the DTBS with the profile's static key — to assemble the final `TimeStampToken` (`formatSigningResponse`). The connector is fully stateless — it holds no intermediate state between phases, which means it can be scaled horizontally without session affinity.

---

## Qualified timestamp support

When the `qualifiedTimestamp` flag on the Phase 1 or Phase 2 request is set to `true`, the connector adds a `qcStatements` extension to the token extensions. The extension carries `esi4-qtstStatement-1` (OID `0.4.0.19422.1.1`) as required by ETSI EN 319 422 for a qualified electronic time-stamp.

Server-supplied extensions always take precedence over request-supplied extensions on OID conflict. This means a client cannot override or suppress the `qcStatements` extension injected for a qualified request — the connector is authoritative about the qualified status claim regardless of what the caller sends.

Setting `qualifiedTimestamp` to `false` (or omitting it) produces a non-qualified RFC 3161 token without the ETSI EN 319 422 extension.
