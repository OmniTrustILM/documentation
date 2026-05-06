---
sidebar_position: 13
---

# Unit Testing

In the microservice architecture, the unit tests are used to test the functionality of the microservice. Unit tests are written by the developer who implements the functionality. Unit tests are executed automatically on the build server.

Unit tests in a microservice has a much higher chance of requiring a network call to fulfill its function. In this case, we use mocking to isolate the code that should be tested from external dependencies on other services or 3rd parties, which is also known as **solitary unit test**.

## Unit testing requirements

- Unit tests must be written for all public methods
- Unit tests have one assertion per test (one scenario per test)
- Unit tests must be independent of each other
- Unit tests must have deterministic behaviour
- Unit tests should cover normal and exceptional scenarios
- Name of the unit test must be descriptive

## Execution of unit tests

Unit tests are executed automatically on every pull request and on every commit to the code base.
Unit tests are executed on the build server.
    