---
sidebar_position: 3
---

# Sample Properties

The following are sample properties that configures timed service for generating assigned keys:

```properties
WORKERGENID1.TYPE=TIMED_SERVICE
WORKERGENID1.IMPLEMENTATION_CLASS=com.czertainly.signserver.module.timedservices.keygeneration.GenerateAssignedKeys
WORKERGENID1.NAME=Key-Generation-Worker

# this is the CryptoToken that will be used for checking and generating the keys
WORKERGENID1.CRYPTOTOKEN=EntrustSAMCryptoToken

# service will be triggered every 600 seconds = 10 minutes
WORKERGENID1.INTERVAL=600

# number of keys that should be available
# service will try to generate number of keys that up to this value during each execution
WORKERGENID1.TARGET_NUMBER_OF_PRE_GENERATED_KEYS=500

# the limit of number of keys that can be generated during one execution of the service
# keep it reasonable to not hit the technology limits
WORKERGENID1.MAXIMAL_NUMBER_OF_KEYS_TO_GENERATE_PER_RUN=100

# entry info property name that should be used to filter affected keys
WORKERGENID1.FILTER_PROPERTY_NAME=Key specification

# value of the filter that will match affected keys
WORKERGENID1.FILTER_VALUE={assigned=true, certified=false, enabled=false}

# prefix of generate keys
WORKERGENID1.KEYALIAS_PREFIX=pregenerated

# cryptographic algorithm for the generated keys
WORKERGENID1.KEYGEN_ALGORITHM=RSA

# specification of the generated key attributes
WORKERGENID1.KEYGEN_SPECIFICATION=4096

# requires transaction for the service
WORKERGENID1.REQUIRES_TRANSACTION=true

WORKERGENID1.ACTIVE=true
WORKERGENID1.SINGLETON=true
```
