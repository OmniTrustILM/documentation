---
sidebar_position: 19
---

# Flow Testing

Flow testing is focused on testing end-to-end functionality of the platform provided by the core components. It does cover scenarios that are not covered by the user interfaces like API scenarios, or scenarios that are executed through the UI (web-based or CLI).

## Flow-scoped services

Each flow may require to have a different set of services. Every time the flow test is executed, this set of service is deployed, testing data is loaded, and after tests are finished, the deployed service are immediately destroyed.

:::info Certificate inventory flow testing
As an example, the certificate inventory flow requires the following end-to-end testing:
1. Upload certificate to inventory
2. Open details of the certificate
3. Change the status of the certificate
4. Change attributes of the certificate
5. Delete the certificate
:::

Flow testing is focused on specific part of the functionality of the platform, rather than the integration testing and complete end-to-end testing of all services. Therefore, the flow testing is executed only for the components that are being tested. The rest of the platform is mocked, including the connectors or 3rd party services.

## Flow testing requirements

- Flow tests must cover all functionality of the platform with core components running
- Flow tests must be independent of each other
- Flow tests must have deterministic behaviour

## Execution of flow tests

Flow tests are executed automatically on schedule bi-daily = every other day at 3:00 AM GMT.
