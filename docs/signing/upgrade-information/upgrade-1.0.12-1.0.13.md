---
sidebar_position: 170
---

# From 1.0.12 To 1.0.13

In release version `1.0.13` the following changes were made as part of the refactoring of the eIDAS packages:

## Split one-time signing package

Split of the package for one-time signing using `Entrust` and `Trident` SAM was done. The following classes needs to be reconfigured for the applicable workers:

### CA Connector 

New implementation class for `EjbcaWSSAMCAConnector` is:
```
company.threekey.signserver.module.sam.onetime.caconnector.EjbcaWSSAMCAConnector
```

New implementation class for `LocalSelfSignedCA` is:
```
company.threekey.signserver.module.sam.onetime.caconnector.LocalSelfSignedCA
```

### Entrust SAM

New implementation class for `EntrustSAMOneTimeCryptoWorker` is: 
```
company.threekey.signserver.module.sam.onetime.entrust.EntrustSAMOneTimeCryptoWorker
```

### Trident SAM

New implementation class for `OneTimeSAMCryptoWorker` is:
```
company.threekey.signserver.module.sam.onetime.trident.OneTimeSAMCryptoWorker
```

New implementation class for `OneTimeUserKeyCryptoWorker` is:
```
company.threekey.signserver.module.sam.onetime.trident.OneTimeUserKeyCryptoWorker
```