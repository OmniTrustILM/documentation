---
sidebar_position: 1
---

# QA Strategy

Ensuring that the CZERTAINLY platform is able to deliver the highest quality is one of success factors of this open source project.
The quality of the platform is ensured by the Quality Assurance (QA) strategy.

The QA strategy describes testing approach, procedures and the tools used to ensure the quality of the platform.

The goals of CZERTAINLY QA strategy are:
- meet the industry quality standards and expectations
- ensure that the platform is able to deliver the highest security, performance and availability
- identify and fix the issues as early as possible
- monitor the quality of the platform during the development and staging
- build robust and automated testing framework
- provide reports and metrics about the quality of the platform

## Scope overview

CZERTAINLY platform consists of several components, microservices, that works together to provide the functionality of the platform.

There are number of component that are considered to be part ot the core of the platform. Such components are providing necessary functionality for the platform to work and they are mandatory to be included in the deployment.

Another components provide extensions to the platform, integration with technologies, or custom functionality. These components are called providers, and they are optional to be included in the deployment. Providers has defined OpenAPI specification and are independent of the platform, anyone can implement provider with desired functionality. Provider can be connected to the platform, which consistently manage operations across different providers.

Every component, whether part of the core or provider, may be developed using different technologies and frameworks.

### In scope components

The QA strategy is focused on the core components and interfaces that works together to deliver the functionality of the platform, independently on the specific implementation and integration with technology through the connectors and providers.

- **Core components** - components that provides the core functionality and logic of the platform. Core components are mandatory to be included in the deployment like access control, identity management, audit logging, messaging and scheduling, internal and external communication and others. For more information about core components, see [Core components](../certificate-key/concept-design/overview.md).
- **Connector APIs** - OpenAPI specification that is categorized into specific functionality providing by external systems and technologies called providers. The provider APIs are in scope of the QA strategy to ensure that the platform is able to communicate with the providers and simulated attributes properly. For more information about the providers, see [Connectors](../certificate-key/connectors/overview.md).
- **User interfaces** - user interface that is used to interact with the platform. The front end is in scope of the QA strategy to ensure that the platform is able to provide the user interface and that the user interface is able to communicate with the platform. For more infromation about the user interfaces, see [Interfaces](../certificate-key/concept-design/architecture/interfaces.md).

### Out of scope components

Because the providers are independent and maintainers do not have control and visibility on the connector implementations, they are considered out of scope of the QA strategy.
The QA strategy simulates the provider APIs to ensure that the platform is able to communicate with the providers and attributes properly.

Integration with 3rd party technology that requires significant effort and resources but does not have significant impact on the quality of the platform is considered to be out of scope of the QA strategy.

## QA strategy components

The following QA strategy components are involved in the overall QA strategy:

| QA strategy component                               | Description                                                                                                                                                                                                           | Purpose                                                                                                                                                                                                      | Scope                                                                                 |
|-----------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------|
| [**Code review**](./code-review.md)                 | Review of the code changes by the other developers before the code is merged in the code base.                                                                                                                        | Code review helps to ensure that coding best practices and conventions are being followed and that changes in the source code are compliant.                                                                 | Every pull request and code change.                                                   |
| [**Unit testing**](./unit-testing.md)               | Testing of the smallest testable parts of the platform, typically individual functions or methods. Unit tests does not guarantee the correct and expected behaviour of the integrated platform.                       | Checks whether the code behaves as expected or not on the class level (for each microservice) or multiple classes. Protects against unintended code changes introducing unexpected behavior.                 | All units, classes, method, functions, etc., that are part of the platform code base. |
| [**API testing**](./api-testing.md)                 | The microservice exposes their APIs. API testing executes various API requests that verifies the expected request and response behaviour.                                                                             | Ensure that the client can request API, detect incompatibility and changes that can break client integrations. Monitor performance metrics for the API.                                                      | APIs of the core components and API specification of the connectors and providers.    |
| [**Flow testing**](./flow-testing.md)               | End-to-end testing focused on the specific flow supported by the platform (certificate inventory, management, reporting, etc.) that provides specific logic and complete functionality that is going to be evaluated. | Checking that components are working and communicating together as expected, verifying data that is written in the database and provided as response are correct. The flow is working according expectation. | Flows supported by the core components.                                               |
| [**Penetration testing**](./penetration-testing.md) | Testing of the security of the platform as white box.                                                                                                                                                                 | Ensure that the platform is able to protect against unauthorized access and malicious attacks.                                                                                                               | Core components of the platform.                                                      |

## Testing principles

The CZERTAINLY platform provides flexibility and open architecture for the integration with other systems. The design of the platform is based on the microservices architecture and the platform is built using the modern technologies and frameworks to comply with the cloud-native principles. For more information about the platform concept, refer to [Concept Overview](../certificate-key/concept-design/overview.md) section.

The testing approach is based on the following principles:
- **Test early and often** - the testing is done as early as possible and as often as possible. The testing is done during the development and staging of the platform
- **Test in isolation** - the testing is done in isolation from other systems. The platform is tested in the isolated environment, where the platform is deployed and configured using the automated scripts
- **Test in production-like environment** - the testing is done in the production-like environment. The platform is deployed and configured in the environment, that is as close as possible to the production environment

## Automated testing

Each part of the QA strategy is automated, including running the tests, generating reports and metrics, and sending notifications.

We use the support of other open source tools and frameworks to build the automated testing framework, for example.

Testing must be implemented as part of the development process and must be executed automatically as part of the continuous integration and continuous delivery (CI/CD) pipeline.
Each test case must be written in the code with associated prerequisites, steps, expected results and teardown steps.
Test cases are run automatically as part of the CI/CD pipeline and the results are reported.

The following is a schedule for each QA strategy components:

| QA strategy component   | Schedule                      |
|-------------------------|-------------------------------|
| **Code review**         | Every pull request and commit |
| **Unit testing**        | Every pull request and commit |
| **API testing**         | Daily                         |
| **Flow testing**        | Every other day               |
| **Penetration testing** | Before release                |

### Structure of tests

The following structure is available for API and Flow test to be executed automatically. The purpose of this structure is to have independent definition of test case to be executed on target environment and collect consistent results.

| Component            | Description                                                                                                                                                                                                                                                                                                                                        |
|----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Test environment** | Each test is executed in the isolated environment, where the platform is deployed and configured using the automated scripts. For every test the environment that should be used for testing is defined by the Helm `values.yaml`.                                                                                                                 |
| **Test data**        | Data that should be used for running the test must be defined and associated with every test to be executed. The test data should be written in the form that can be automatically used to be loaded in the Test deployment before actual tests will run. It can be in the form of JSON data that is loaded into the platform using API endpoints. |
| **Test case**        | Description of the test case that should be executed. The test case steps are written in the form that can be automatically executed in the workflow.                                                                                                                                                                                              |
| **Test execution**   | Execution requirements for the test to be run in automated framework. Identification of workflow that should be triggered with the structure of test.                                                                                                                                                                                              |

The proper structure of the test allows us to run the tests automatically through the consistent workflow and collect the results in the same format.

## Reporting

The reporting is done automatically as part of the automated testing framework. The reporting provided in the form that can be transformed to human readable format or processed further by application.

The report is attached to the workflow that was used to trigger the test execution. The report contains the following information:
- Test structure that was executed
- Execution time
- Test results (for each step executed in the test case)
- Additional information in case of failed test 

When the workflow contains at least one failed test, it must be marked as failed and notification triggered to the QA team.
