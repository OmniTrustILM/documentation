---
sidebar_position: 5
---

# Key Data Certificate Storage Provider

The implementation class of the Key Data Certificate Storage Provider is:

```
com.czertainly.signserver.module.awskms.certificate.KeyDataCertificateStorage
```

There no additional properties to be configured for the Key Data Certificate Storage Provider.

Certificates are stored inside the SignServer databases to the table `KeyData` with the following data:
```
keyAlias = userId_keyId
wrappingKeyAlias = onlyCert
wrappingCipher = 99
keyData = onlyCert
certData = PEM certificate
```
