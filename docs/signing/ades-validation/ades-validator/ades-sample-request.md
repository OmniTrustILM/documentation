---
sidebar_position: 5
---

# AdES Validator Sample Request

The following is a sample Postman request to validate the PDF document:

```json
{
  "name": "PAdES Validate",
  "event": [
    {
      "listen": "test",
      "script": {
        "exec": [
          ""
        ],
        "type": "text/javascript"
      }
    }
  ],
  "protocolProfileBehavior": {
    "disabledSystemHeaders": {
      "connection": true,
      "accept-encoding": true,
      "accept": true,
      "user-agent": true,
      "host": true
    }
  },
  "request": {
    "auth": {
      "type": "noauth"
    },
    "method": "POST",
    "header": [],
    "body": {
      "mode": "formdata",
      "formdata": [
        {
          "key": "file",
          "type": "file",
          "src": "signed.pdf"
        },
        {
          "key": "workerName",
          "value": "AdESValidator",
          "type": "text"
        }
      ]
    },
    "url": {
      "raw": "http://signing.czertainly.com:8080/signserver/process",
      "protocol": "http",
      "host": [
        "signing",
        "czertainly",
        "com"
      ],
      "port": "8080",
      "path": [
        "signserver",
        "process"
      ]
    }
  },
  "response": []
}
```

The following is a XML Simple Report as output from the validation request:

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<SimpleReport ValidationTime="2021-07-03T14:48:02" xmlns="http://dss.esig.europa.eu/validation/simple-report">
    <ValidationPolicy>
        <PolicyName>QES AdESQC TL based</PolicyName>
        <PolicyDescription>Validate electronic signatures and indicates whether they are Advanced electronic Signatures (AdES), AdES supported by a Qualified Certificate (AdES/QC) or a
		Qualified electronic Signature (QES). All certificates and their related chains supporting the signatures are validated against the EU Member State Trusted Lists (this includes
		signer's certificate and certificates used to validate certificate validity status services - CRLs, OCSP, and time-stamps).
	</PolicyDescription>
    </ValidationPolicy>
    <DocumentName></DocumentName>
    <ValidSignaturesCount>1</ValidSignaturesCount>
    <SignaturesCount>1</SignaturesCount>
    <Signature SignatureFormat="PKCS7-B" ExtensionPeriodMin="2021-07-03T14:48:03" ExtensionPeriodMax="2024-01-18T08:49:41" Id="S-82AB17C58FD78D31836E755408B850C1B7295C3F91A73AAF0AB22060684197B1">
        <CertificateChain>
            <Certificate>
                <id>C-BABE2B45CF21D2BF5DE4C32AFAE3D585945B73674FC41A1C704C593C9F6DEB98</id>
                <qualifiedName>TEST HUMAN</qualifiedName>
            </Certificate>
            <Certificate>
                <id>C-5779BA66C768FE7E5A5BB74A225FA8B69CD6942AF481355630E5AD78B34DFF2B</id>
                <qualifiedName>Qualified SubCA</qualifiedName>
            </Certificate>
            <Certificate>
                <id>C-BC7F7862E685C7A7D9826A58EA32D183D4893FCC8F8FD6D900C9769A987E77F0</id>
                <qualifiedName>Qualified RootCA</qualifiedName>
            </Certificate>
        </CertificateChain>
        <Indication>TOTAL_PASSED</Indication>
        <Errors>Unable to build a certificate chain until a trusted list!</Errors>
        <Warnings>There is no Next Update defined for the revocation data!</Warnings>
        <SigningTime>2021-01-05T17:59:23</SigningTime>
        <BestSignatureTime>2021-07-03T14:48:02</BestSignatureTime>
        <SignedBy>TEST HUMAN</SignedBy>
        <SignatureLevel description="Not applicable">N/A</SignatureLevel>
        <SignatureScope name="Full PDF" scope="FULL">Full document</SignatureScope>
    </Signature>
</SimpleReport>
```
