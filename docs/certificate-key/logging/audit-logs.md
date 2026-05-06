---
sidebar_position: 6
---

# Audit Logs

Audit log records all activities and operations in CZERTAINLY initiated by some user. It can be used to reconstruct any event in case of investigation. It also proves the compliance with the various standards and regulations, such as PCI DSS, ISO 27k, GDPR, WebTrust, etc.

## Audit log structure

Audit logs have specific structure defined by [Log Record Structure](log-record-structure.md). This ensures that structure of audit log is consistent, can be validated and easily parsed by log collectors.

## Audit log persistence

Audit logs are typically shipped to the logging infrastructure, where they are stored and processed, for example, by the SIEM solution. The retention period of audit logs should be defined based on the organization's policy and the requirements of the regulations.

They can be stored in the database of the Core, but it is recommended to store them in a separate system to ensure their integrity and availability, including correlation with other log records, not only from the Core but also from other systems.

In case you do not want to collect audit logs, you can disable them in the settings.
