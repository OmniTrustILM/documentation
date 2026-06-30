---
sidebar_position: 1
---

# Introduction

No signature process is complete with its counterpart, validation of the signature. The **AdES Signature Validation** provides an easy and consistent way to validate signatures based on various document / data types.

The validation is based on the [ETSI EN 319 102-1](https://www.etsi.org/deliver/etsi_en/319100_319199/31910201/01.01.01_60/en_31910201v010101p.pdf) - Electronic Signatures and Infrastructures (ESI); Procedures for Creation and Validation of AdES Digital Signatures.

The status on the full validation of one of the signature in the context of a particular signature validation policy can be:

<table>
  <tbody>
    <tr>
        <td><b>TOTAL-PASSED</b></td>
        <td>when the cryptographic checks of the signature (including checks of hashes of individual data
objects that have been signed indirectly) succeeded as well as all checks prescribed by the
signature validation policy have been passed</td>
    </tr>
    <tr>
        <td><b>TOTAL-FAILED</b></td>
        <td>the cryptographic checks of the signature failed (including checks of hashes of individual data
objects that have been signed indirectly), or it is proven that the generation of the signature was
after the revocation of the signing certificate, or because the signature is not conformant to one
of the base standards to the extent that the cryptographic verification building block is unable
to process it</td>
    </tr>
    <tr>
        <td><b>INDETERMINATE</b></td>
        <td>the results of the performed checks do not allow to ascertain the signature to be
TOTAL-PASSED or TOTAL-FAILED</td>
    </tr>
  </tbody>
</table>

:::info
For more information about the DSS framework implementation visit [official documentation](https://github.com/esig/dss/blob/master/dss-cookbook/src/main/asciidoc/dss-documentation.adoc).
:::
