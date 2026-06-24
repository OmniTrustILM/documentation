---
sidebar_position: 5
---

# Available Report Types

**AdES module** for the SignServer seamlessly integrates the DSS framework libraries within the standard interfaces of the Validation Workers. Therefore, it is possible to achieve the same signature formats and compliance level.

## Validation reports

The following reports are available as output from the validation of the signature:

- Simple Report
- Detailed Report
- Diagnostic Data Report
- ETSI Validation Report

<table>
  <tbody>
    <tr>
        <td><b>Simple Report</b></td>
        <td>The purpose of this report is to make as simple as possible the information while keeping the most important elements. Thus the end user can, at a glance, have a synthetic view of the validation.</td>
    </tr>
    <tr>
        <td><b>Detailed Report</b></td>
        <td>The structure of detailed report is based on the ETSI EN 319 102-1 and is built around Basic Building Blocks, Basic Validation Data, Timestamp Validation Data, AdES-T Validation Data and Long Term Validation Data.</td>
    </tr>
    <tr>
        <td><b>Diagnostic Data Report</b></td>
        <td>This is a data set constructed from the information contained in the signature itself, but also from information retrieved dynamically as revocation data and information extrapolated as the mathematical validity of a signature. All this information is independent of the applied validation policy. Two different validation policies applied to the same diagnostic data can lead to different results.</td>
    </tr>
    <tr>
        <td><b>ETSI Validation Report</b></td>
        <td>The ETSI Validation Report represents an implementation of TS 119 102-2. The report contains a standardized result of an ASiC digital signature validation. It includes the original validation input data, the applied validation policy, as well as the validation result of one or more signature(s) and its(their) constraints.</td>
    </tr>
  </tbody>
</table>

For more information about the DSS framework implementation visit [official documentation](https://github.com/esig/dss/blob/master/dss-cookbook/src/main/asciidoc/dss-documentation.adoc).
