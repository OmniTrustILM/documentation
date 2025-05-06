---
sidebar_position: 26
---

# From 1.14.0 To 1.15.1

In release version `1.15.0` the following changes were made as part of the integration efforts with the CZERTAINLY platform:

## TimeMonitor using built-in SNTP in containerized deployments

The legacy NTP implementation using local NTP commands was replaced with the built-in SNTP implementation in the dockerized deployments.
`NTP_SERVERS` environment variable is no longer used.
No changes to the configuration of Time Monitor are needed.

:::warning
Make sure that your Time Monitor configuration works properly after the upgrade to this version . Test the configuration before you put it into production. Make necessary changes to the configuration if needed. Refer to the [TimeMonitor Configuration](https://doc.primekey.com/signserver/signserver-reference/signserver-timemonitor-application/signserver-timemonitor-overview/timemonitor-configuration) documentation for more information.
:::

## Fixed compatibility with PostgreSQL database

Reported issued with the PostgreSQL database were fixed.
The signature activation module keys are fully compatible.

## Other changes

There were also other minor changes and fixes:
- updated dependencies
- hardened Docker image running with non-root user
- improved configuration options for containerized deployments
- fixed public web page links
