---
sidebar_position: 8
---

# Entrust SAM Health Check Service Sample Configuration

The following is a sample configuration of the `HealthCheckTimedService` for Entrust SAM:

```
WORKERGENID1.TYPE=TIMED_SERVICE
WORKERGENID1.IMPLEMENTATION_CLASS=com.czertainly.signserver.module.entrustsam.timedservice.HealthCheckTimedService
WORKERGENID1.ACTIVE=true
WORKERGENID1.NAME=EntrustSAMHealthCheckTimedService

# Name reference to the Entrust SAM CryptoToken that should be monitored
WORKERGENID1.CRYPTOTOKEN=EntrustSAMCryptoToken

# Defines the interval in seconds the service should run.
WORKERGENID1.INTERVAL=60
```
