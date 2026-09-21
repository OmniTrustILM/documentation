---
sidebar_position: 30
---

# Available Connectors

`Connectors` can be developed by anyone. There may be number of `Connectors` driven by the community and also `Connectors` developed for some specific purpose and use case.

Discover more information on [ILM GitHub](https://github.com/OmniTrustILM/ilm) pages.

The following `Connectors` are officially available:

| Connector Name                 | Function Groups                                  | Kinds                                                                                                      |
|--------------------------------|--------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| Common Credential Provider     | <span class="badge">Credential Provider</span>   | <span class="badge">Basic</span> <span class="badge">SoftKeyStore</span> <span class="badge">ApiKey</span> |
|                                | <span class="badge">Secret Provider</span>       |                                                                                                            |
| Cryptosense Discovery Provider | <span class="badge">Discovery Provider</span>    | <span class="badge">Cryptosense</span>                                                                     |
| CT Logs Discovery Provider     | <span class="badge">Discovery Provider</span>    | <span class="badge">CTLogs-SSLMate</span>                                                                  |
| EJBCA Legacy Connector         | <span class="badge">Authority Provider</span>    | <span class="badge">LegacyEjbca</span>                                                                     |
| EJBCA NG Connector             | <span class="badge">Authority Provider</span>    | <span class="badge">EJBCA</span>                                                                           |
|                                | <span class="badge">Discovery Provider</span>    | <span class="badge">EJBCA</span> <span class="badge">EJBCA_SCHEDULE</span>                                 |
| Email Notification Provider    | <span class="badge">Notification Provider</span> | <span class="badge">EMAIL</span>                                                                           |
| External Authority Provider    | <span class="badge">Authority Provider</span>    | <span class="badge">External</span>                                                                        |
| Webhook Notification Provider  | <span class="badge">Notification Provider</span> | <span class="badge">WEBHOOK</span>                                                                         |
| HashiCorp Vault Connector      | <span class="badge">Authority Provider</span>    | <span class="badge">HVault</span>                                                                          |
|                                | <span class="badge">Discovery Provider</span>    | <span class="badge">HVault</span>                                                                          |
|                                | <span class="badge">Secret Provider</span>       |                                                                                                            |
| Keystore Entity Provider       | <span class="badge">Entity Provider</span>       | <span class="badge">Keystore</span>                                                                        |
| PyADCS Connector               | <span class="badge">Authority Provider</span>    | <span class="badge">PyADCS-WinRM</span>                                                                    |
|                                | <span class="badge">Discovery Provider</span>    | <span class="badge">PyADCS-WinRM</span>                                                                    |
| Network Discovery Provider     | <span class="badge">Discovery Provider</span>    | <span class="badge">IP-Hostname</span>                                                                     |
| Software Cryptography Provider | <span class="badge">Cryptography Provider</span> | <span class="badge">SOFT</span>                                                                            |
| X.509 Compliance Provider      | <span class="badge">Compliance Provider</span>   | <span class="badge">x509</span>                                                                            |

## Connector NG

[Connector NG](./common-interfaces/overview.md#connector-ng) connectors describe their capabilities through versioned interfaces rather than Function Groups and Kinds. The following Connector NG connectors are officially available:

| Connector Name                                                                                 | Interface                                                                               |
|------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| [OTPKI Connector](../integration-guides/otpki-connector/overview.md)                           | [Authority Provider v3](./provider-interfaces/authority-provider-v3.md)                 |
| [MS ADCS NG Connector](../integration-guides/ms-adcs-ng-connector/overview.md)                 | [Authority Provider v3](./provider-interfaces/authority-provider-v3.md)                 |
| [PKCS#11 Cryptography Provider](../integration-guides/pkcs11-cryptography-provider/overview.md) | [Cryptography Provider](./provider-interfaces/cryptography-provider.md)                 |
| [Timestamp Formatting Connector](../../signing/timestamping/timestamp-formatting-connector.md) | [Signature Formatting Provider](./provider-interfaces/signature-formatting-provider.md) |
