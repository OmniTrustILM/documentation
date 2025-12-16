---
sidebar_position: 160
---

# From 1.0.13 To 1.14.0

In release version `1.14.0` the following changes were made as part of the integration efforts with the CZERTAINLY platform:

## Change of the base package

The base package was changed from `company.threekey` to `com.czertainly`. This change was made in accordance with the roadmap and integration efforts of the CZERTAINLY Signing with the platform and to prepare for next major release.

Each configuration consisting of the `company.threekey` module needs to be updated to `com.czertainly` in order to work with this new version.

## Example of the change

The following example shows the change of the base package from `company.threekey` to `com.czertainly` on the PAdES Signer sample configuration. See the change in the `AUTHTYPE` and `IMPLEMENTATION_CLASS` properties.

```
WORKER1003.TYPE=PROCESSABLE
WORKER1003.TSA_USERNAME=test
WORKER1003.EMBED_CRL=true
WORKER1003.CRYPTOTOKEN=EntrustSAMCryptoToken
WORKER1003.DISABLEKEYUSAGECOUNTER=true
WORKER1003.DIGESTALGORITHM=SHA256
WORKER1003.AUTHTYPE=com.czertainly.signserver.module.extendedjws.ExtendedJwsAuthorizer <-- Change
WORKER1003.NAME=PAdES-Baseline-LTA
WORKER1003.TSA_PASSWORD=test
WORKER1003.TSA_URL=https\://freetsa.org/tsr
WORKER1003.DEFAULTKEY=testKey
WORKER1003.IMPLEMENTATION_CLASS=com.czertainly.signserver.module.pades.signer.PAdESSigner <-- Change
WORKER1003.SIGNATURE_LEVEL=PAdES-BASELINE-LTA
WORKER1003.ADD_VISIBLE_SIGNATURE=false
WORKER1003.ACCEPT_ALL_USERNAMES=true
```