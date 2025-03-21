---
sidebar_position: 1
---

# AdES Signature Formats

AdES stands for Advanced Electronic Signature. It is an electronic signature format that has met the requirements set forth under [eIDAS](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=uriserv:OJ.L_.2014.257.01.0073.01.ENG) regulation. These formats are technically implemented as a Baseline Profiles defined by the European Telecommunications Standards Institute (ETSI).

It includes the following eSignature baseline profiles:

| AdES                                                            | Description                                                                                                                                                                                                                                                                                                                               |
|-----------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **PAdES** (PDF Advanced Electronic Signature) Baseline Profile  | **ETSI EN 319 142**<br/> PDF Advanced Electronic Signature Profiles (PAdES) <ul> <li>[Part 1: Building blocks and PAdES baseline signatures](http://www.etsi.org/deliver/etsi_en/319100_319199/31914201/)</li> <li>[Part 2: Additional PAdES signatures profiles](http://www.etsi.org/deliver/etsi_en/319100_319199/31914202/)</li> </ul> |
| **XAdES** (XML Advanced Electronic Signatures) Baseline Profile | **ETSI EN 319 132**<br/> XML Advanced Electronic Signatures (XAdES) <ul> <li>[Part 1: Building blocks and XAdES baseline signatures](http://www.etsi.org/deliver/etsi_en/319100_319199/31913201/)</li> <li>[Part 2: Extended XAdES signatures](http://www.etsi.org/deliver/etsi_en/319100_319199/31913202/)</li> </ul>                    |
| **CAdES** (CMS Advanced Electronic Signature) Baseline Profile  | **ETSI EN 319 122**<br/> CMS Advanced Electronic Signatures (CAdES) <ul> <li>[Part 1: Building blocks and CAdES baseline signatures](http://www.etsi.org/deliver/etsi_en/319100_319199/31912201/)</li> <li>[Part 2: Extended CAdES signatures](http://www.etsi.org/deliver/etsi_en/319100_319199/31912202/)</li> </ul>                    |
| **JAdES** (JSON Advanced Electronic Signature) Baseline Profile | **ETSI TS 119 182-1**<br/> JSON Advanced Electronic Signatures (JAdES) <ul> <li>[Part 1: Building blocks and JAdES baseline signatures](http://www.etsi.org/deliver/etsi_ts/119100_119199/11918201/)</li> </ul>                                                                                                                           |
| **ASiC** (Associated Signature Container) Baseline Profile      | **ETSI EN 319 162**<br/> Associated Signature Containers (ASiC) <ul> <li>[Part 1: Building blocks and ASiC baseline containers](http://www.etsi.org/deliver/etsi_en/319100_319199/31916201/)</li> <li>[Part 2: Additional ASiC containers](http://www.etsi.org/deliver/etsi_en/319100_319199/31916202/)</li> </ul>                        |                                        |

## Digital Signature Service framework

Digital Signature Service (DSS) framework is an open-source library for electronic signature creation and validation developed and provided by [CEF Digital](https://ec.europa.eu/cefdigital/wiki/display/CEFDIGITAL/CEF+Digital+Home). Implementation of the AdES baseline profiles and signature formats is part of the DSS library. It supports all baseline levels:

<table>
  <tbody>
    <tr>
        <td><b>B-B</b></td>
        <td>level provides requirements for the incorporation of signed and some unsigned attributes when the signature is actually generated.</td>
    </tr>
    <tr>
        <td><b>B-T</b></td>
        <td>level provides requirement for the generation and inclusion of a trusted token for an existing signature, proving that the signature itself actually existed at a certain date and time.</td>
    </tr>
    <tr>
        <td><b>B-LT</b></td>
        <td>level provides requirements for the incorporation of all the material required for validating the signature in the signature document. This level aims to tackle the long-term availability of the validation material.</td>
    </tr>
    <tr>
        <td><b>B-LTA</b></td>
        <td>level provides requirements for the incorporation of time-stamp tokens that allow validation of the signature long time after its generation. This level aims to tackle the long-term availability and integrity of the validation material.</td>
    </tr>
  </tbody>
</table>

For more information about the DSS framework implementation visit [official documentation](https://github.com/esig/dss/blob/master/dss-cookbook/src/main/asciidoc/dss-documentation.adoc).
