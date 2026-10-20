---
sidebar_position: 4
---

# Available Signature Formats

**AdES module** for the SignServer seamlessly integrates the DSS framework libraries within the standard interfaces of the Signer Workers. Therefore, it is possible to achieve the same signature formats and compliance level.

Implementation class for the **PAdES**, **XAdES**, **CAdES**, **JAdES**, or **ASiC**, is configured in the Signer together with other relevant properties, including the Crypto Token or internal TSAs. Integration of SignServer and DSS framework gives you all benefits of centralized mature signing solution with eIDAS compliant signature formats.

The following tables compare DSS signature profiles by supported data types and signing capabilities. “XML only” and “SigD only” specify restrictions for multiple files.

## Supported data types

| Signature profile / packaging | XML | JSON | PDF | Binary | Digest |
| --- | --- | --- | --- | --- | --- |
| XAdES enveloping — Base64 encoded | Yes | Yes | Yes | Yes | No |
| XAdES enveloping — Embed XML | Yes | No | No | No | No |
| XAdES enveloping — Manifest | Yes | Yes | Yes | Yes | Yes |
| XAdES enveloping — Canonicalization | Yes | No | No | No | No |
| XAdES enveloped — Enveloped transformation | Yes | No | No | No | No |
| XAdES enveloped — XPath | Yes | No | No | No | No |
| XAdES enveloped — Filter2 | Yes | No | No | No | No |
| XAdES enveloped — Canonicalization | Yes | No | No | No | No |
| XAdES detached | Yes | Yes | Yes | Yes | Yes |
| XAdES internally detached | Yes | No | No | No | No |
| CAdES enveloping | Yes | Yes | Yes | Yes | No |
| CAdES detached | Yes | Yes | Yes | Yes | Yes |
| PAdES enveloped | No | No | Yes | No | No |
| JAdES enveloping — Compact serialization | Yes | Yes | Yes | Yes | No |
| JAdES enveloping — Flattened JSON serialization | Yes | Yes | Yes | Yes | No |
| JAdES enveloping — JSON serialization | Yes | Yes | Yes | Yes | No |
| JAdES detached — Compact serialization | Yes | Yes | Yes | Yes | Yes |
| JAdES detached — Flattened JSON serialization | Yes | Yes | Yes | Yes | Yes |
| JAdES detached — JSON serialization | Yes | Yes | Yes | Yes | Yes |
| ASiC-S — CAdES / XAdES | Yes | Yes | Yes | Yes | No |
| ASiC-E — CAdES / XAdES | Yes | Yes | Yes | Yes | No |

## Signing capabilities

| Signature profile / packaging | Multiple files | Multiple signatures | Counter signature | Standalone timestamp |
| --- | --- | --- | --- | --- |
| XAdES enveloping — Base64 encoded | Yes | No | Yes | No |
| XAdES enveloping — Embed XML | XML only | No | Yes | No |
| XAdES enveloping — Manifest | Yes | No | Yes | No |
| XAdES enveloping — Canonicalization | XML only | No | Yes | No |
| XAdES enveloped — Enveloped transformation | No | No | Yes | No |
| XAdES enveloped — XPath | No | Yes | Yes | No |
| XAdES enveloped — Filter2 | No | Yes | Yes | No |
| XAdES enveloped — Canonicalization | XML only | Yes | Yes | No |
| XAdES detached | Yes | No | Yes | No |
| XAdES internally detached | XML only | Yes | Yes | No |
| CAdES enveloping | No | Yes | Yes | No |
| CAdES detached | No | Yes | Yes | No |
| PAdES enveloped | No | Yes | No | Yes |
| JAdES enveloping — Compact serialization | No | No | No | No |
| JAdES enveloping — Flattened JSON serialization | No | No | Yes | No |
| JAdES enveloping — JSON serialization | No | Yes | Yes | No |
| JAdES detached — Compact serialization | SigD only | No | No | No |
| JAdES detached — Flattened JSON serialization | SigD only | No | Yes | No |
| JAdES detached — JSON serialization | SigD only | Yes | Yes | No |
| ASiC-S — CAdES / XAdES | Yes | Yes | Yes | Yes |
| ASiC-E — CAdES / XAdES | Yes | Yes | Yes | Yes |

For more information about the DSS framework implementation visit [official documentation](https://github.com/esig/dss/blob/master/dss-cookbook/src/main/asciidoc/dss-documentation.adoc).
