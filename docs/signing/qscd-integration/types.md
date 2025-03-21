---
sidebar_position: 3
---

# QSCD Types

Based on Article 1 of [CID (EU) 2016/650](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016D0650), two main types of QSCD exist:
- **TYPE 1 QSCD** - where the electronic signature creation data or electronic seal creation data is held in an entirely but not necessarily exclusively user-managed environment
- **TYPE 2 QSCD** - where a qualified trust service provider (QTSP) manages the electronic signature creation data or electronic seal creation data on behalf of a signatory or of a creator of a seal

:::info
Type 2 QSCD is realized by the combination of a Cryptographic Module (CM) and a dedicated Signature Activation Module (SAM). The CM provides the underlying cryptographic functionalities for secure key generation, signature generation, seal generation and key storage. The SAM ensures sole control of the signatory over the use of his electronic signature creation data and/or electronic seal creation data.

See [SAM Integration](../sam-integration/overview.md), for more information.
:::

## List of referred standards to QSCD types

| **Identification**       | **Description**                                                                                                                                                       |
|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **ISO/IEC 15408-1:2009** | Information technology — Security techniques — Evaluation criteria for IT security — Part 1                                                                           |
| **ISO/IEC 15408-2:2008** | Information technology — Security techniques — Evaluation criteria for IT security — Part 2                                                                           |
| **ISO/IEC 15408-3:2008** | Information technology — Security techniques — Evaluation criteria for IT security — Part 3                                                                           |
| **ISO/IEC 18045:2008**   | Information technology — Security techniques — Methodology for IT security evaluation                                                                                 |
| **EN 419211-1:2014**     | Protection profiles for secure signature creation device — Part 1: Overview                                                                                           |
| **EN 419211-2:2013**     | Protection profiles for secure signature creation device — Part 2: Device with key generation                                                                         |
| **EN 419211-3:2013**     | Protection profiles for secure signature creation device — Part 3: Device with key import                                                                             |
| **EN 419211-4:2013**     | Protection profiles for secure signature creation device — Part 4: Extension for device with key generation and trusted channel to certificate generation application |
| **EN 419211-5:2013**     | Protection profiles for secure signature creation device — Part 5: Extension for device with key generation and trusted channel to signature creation application     |
| **EN 419211-6:2014**     | Protection profiles for secure signature creation device — Part 6: Extension for device with key import and trusted channel to signature creation application         |
