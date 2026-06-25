---
sidebar_position: 2
---

# Standards and Compliance

ILM-native timestamping is built to the standards that govern electronic time-stamping in
the European Union and the wider PKI ecosystem. This page consolidates the normative
references the implementation follows, and maps the requirements most relevant to a
Qualified Trust Service Provider (QTSP) to the ILM mechanism that satisfies them and the
page that documents it.

The references below are cited by their latest published editions. Specific clauses are
named where they are stable across editions; otherwise requirements are referenced by
topic. This page describes which standards ILM *implements* — it is not a statement of
formal conformance, which is the outcome of a conformity assessment by an accredited body.

---

## Regulatory context: qualified vs non-qualified time stamps

In the EU, electronic time stamps are defined by **Regulation (EU) No 910/2014 (eIDAS)**.
The Regulation distinguishes two assurance levels:

- An **electronic time stamp** (eIDAS Art. 3(33)) binds data to a particular time. Any
  electronic time stamp benefits from the non-discrimination rule of Art. 41(1).
- A **qualified electronic time stamp** (eIDAS Art. 42) additionally satisfies three
  requirements and, under Art. 41(2), enjoys a legal presumption of the accuracy of the
  date and time it indicates and the integrity of the data it is bound to. Only a QTSP may
  issue them.

ILM supports both. A Signing Profile issues a qualified time-stamp token when the
qualified status is requested (the `qualifiedTimestamp` flag), which causes the
[Timestamp Formatter Connector](./timestamp-formatter-connector.md) to add the
`qcStatements` extension required by ETSI EN 319 422; otherwise it issues a standard
RFC 3161 token. See the [Overview](./overview.md) for the workflow/scheme taxonomy.

### How ILM meets the eIDAS Art. 42 requirements

| eIDAS Art. 42(1) requirement | ILM mechanism | Documented on |
|---|---|---|
| (a) binds date and time to data so the data cannot be changed undetectably | The message imprint (hash) is carried in the `TSTInfo` and protected by the CMS signature (RFC 3161, RFC 5652) | [Request flow](./timestamping-flow.md), [Formatter connector](./timestamp-formatter-connector.md) |
| (b) based on an accurate time source linked to UTC | Time Quality Monitor polls NTP/UTC sources (SNTP, RFC 4330) and gates issuance against an accuracy/drift policy (ETSI EN 319 421) | [Time Quality Monitor](./time-quality-monitor.md), [Time Quality Configuration](./profiles/time-quality-configuration.md) |
| (c) signed with an advanced electronic signature/seal of the QTSP | The token is signed with the TSA's managed key on a cryptographic token, using a certificate carrying the `id-kp-timeStamping` EKU (RFC 5280) | [Request flow](./timestamping-flow.md) §6, §9 |

---

## Normative references

| Reference | Title | What it governs in ILM |
|---|---|---|
| Regulation (EU) No 910/2014 (eIDAS), Art. 41–42 | Electronic identification and trust services — legal effect and requirements for (qualified) electronic time stamps | Qualified vs non-qualified framing; legal presumption |
| ETSI EN 319 421 | Policy and security requirements for Trust Service Providers issuing Electronic Time-Stamps | Time-source accuracy and calibration, serial-number uniqueness, event logging / record retention |
| ETSI EN 319 422 | Time-stamping protocol and time-stamp token profiles | Time-stamp token profile; qualified time-stamp `qcStatements` (`esi4-qtstStatement-1`, OID `0.4.0.19422.1.1`) |
| ETSI EN 319 412 (parts 1–5) | Certificate Profiles | TSA (TSU) signing-certificate eligibility |
| ETSI TS 119 312 | Cryptographic Suites | Permitted digest and signature algorithms |
| IETF RFC 3161 | Internet X.509 PKI Time-Stamp Protocol (TSP) | `TimeStampReq` / `TimeStampResp`, `TSTInfo`, status/failure codes |
| IETF RFC 5816 | ESSCertIDv2 Update for RFC 3161 | `SigningCertificateV2` signed attribute (carrying `ESSCertIDv2`) binding the TSA certificate |
| IETF RFC 5652 | Cryptographic Message Syntax (CMS) | `TimeStampToken` as CMS `SignedData`; `SignedAttributes` |
| IETF RFC 5280 | Internet X.509 PKI Certificate and CRL Profile | 160-bit serial-number limit; `id-kp-timeStamping` extended key usage (OID `1.3.6.1.5.5.7.3.8`) |
| IETF RFC 4330 | Simple Network Time Protocol (SNTP) Version 4 | Time Quality Monitor NTP polling |

RFCs are available at `https://www.rfc-editor.org/`. ETSI deliverables are available from
the ETSI standards portal; eIDAS is published in the Official Journal of the European Union.

---

## Requirement → implementation map

The table maps the QTSP-relevant requirements to the ILM mechanism and the page that
covers it in depth.

| Requirement | Standard | ILM mechanism | Documented on |
|---|---|---|---|
| Time-source accuracy linked to UTC; clock calibration within a stated tolerance | ETSI EN 319 421 (time-source requirements); eIDAS Art. 42(1)(b) | Time Quality Monitor evaluates NTP offset against `maxClockDrift`; issuance gated on **OK** status; `accuracy` embedded in `TSTInfo.Accuracy` | [Time Quality Monitor](./time-quality-monitor.md), [Time Quality Configuration](./profiles/time-quality-configuration.md) |
| Each time-stamp token carries a unique serial number | ETSI EN 319 421; RFC 3161 §2.4.2; RFC 5280 (160-bit limit) | Coordination-free 64-bit generator producing structurally unique, monotonic serials within the 160-bit field | [Request flow](./timestamping-flow.md) §7, [Limitations](./limitations.md) |
| Qualified time-stamp token profile | ETSI EN 319 422; eIDAS Art. 42 | `qcStatements` extension with `esi4-qtstStatement-1` injected for qualified requests, authoritative over client extensions | [Formatter connector](./timestamp-formatter-connector.md) |
| TSA signing certificate eligible for time-stamping | RFC 5280 (`id-kp-timeStamping` EKU); ETSI EN 319 412 | Signing-certificate eligibility check (EKU, key usage, validity) for the configured qualification level | [Request flow](./timestamping-flow.md) §6 |
| Permitted cryptographic algorithms | ETSI TS 119 312 | `allowedDigestAlgorithms` request validation; configured signature algorithm | [Request flow](./timestamping-flow.md) §3, §9 |
| Event logging and record retention | ETSI EN 319 421 (records of operation) | Signing records with configurable persistence and retention | [Signing Records](./signing-records.md) |

---

## Related pages

- [Timestamping Overview](./overview.md) — workflow/scheme taxonomy and component architecture
- [Timestamping Request Flow](./timestamping-flow.md) — where each standard is applied in the request path
- [Timestamp Formatter Connector](./timestamp-formatter-connector.md) — qualified time-stamp `qcStatements`
- [Time Quality Configuration](./profiles/time-quality-configuration.md) — accuracy and drift parameters
