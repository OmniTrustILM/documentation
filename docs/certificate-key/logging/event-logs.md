---
sidebar_position: 9
---

# Event Logs

Event logs are used to record certificate management, cryptographic key management, secret management, and other operation-related events. The event logs are used to reconstruct the complete history of the operations and its source can be user or system itself in case of automatic events. Event logs are essential for monitoring and troubleshooting the platform.

## Event log structure

Event logs follows structure defined by [Log Record Structure](log-record-structure.md). This ensures that structure of each event log is consistent, can be validated and easily parsed by log collectors for further processing.

## Event log persistence

Event logs are not persisted by the platform, but they can be shipped to the logging infrastructure.
