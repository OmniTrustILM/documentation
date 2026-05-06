---
sidebar_position: 15
---

# API Testing

API testing is focused on testing contracts between:
- between the platform and the `Client`, also known as core producer API testing
- the platform and the `Connector`, also known as core consumer API testing

The API is tested according to the valid OpenAPI specification with all the possible inputs and outputs with their data structures and side effects.

## Core producer API testing

Core producer API testing is focused on testing the API of the platform that is used by the `Client` to communicate with the platform.
In this case the client requests endpoint of the core API and evaluates the response. The functionality of the connector is mocked.

For the purpose of this testing, the core component of the platform must be deployed and loaded with testing data.
Every time the core producer API testing should be executed, the environment with the core components is deployed, and after tests are finished, is immediately destroyed.
To achieve the consistent results, the core producer API testing must be executed with the same testing data.

## Core consumer API testing

Core consumer API testing is focused on testing the API of the platform that is used by the `Connector` to communicate with the platform.
Testing the specific implementation of the connector is out of scope of this testing.

Connector and metadata attributes are mocked for the purpose of this testing. However, all possible options of attributes must be tested and confirmed that the platform is able to handle them properly.

## API testing requirements

- API tests must cover all endpoints
- API tests must cover all possible inputs and outputs
- API tests must cover all possible side effects
- API tests must be independent of each other
- API tests must have deterministic behaviour
- API tests should cover functionality comprised of multiple endpoints

## Execution of API tests

API tests are executed automatically on schedule nightly = every night at 1:00 AM GMT.
