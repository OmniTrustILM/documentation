---
sidebar_position: 2
---

# From 1.19.3 To 1.19.4

In release version `1.19.4` the following changes were made:

## Entrust SAM Health Check Timed Service

Added a new timed service, [Entrust SAM Health Check Timed Service](../sam-integration/entrust-sam/entrust-sam-health-check.mdx), that periodically checks the health of the Entrust SAM connection. This service helps ensure that the connection to the Entrust SAM is active and functioning properly, allowing for proactive monitoring and maintenance of the SAM integration.

## Bug Fixes and Minor Improvements

The release includes bug fixing and minor improvements:
- Fix context loading for Entrust SAM SAD Provider
- Do not use class variable for config params as it is not thread safe
