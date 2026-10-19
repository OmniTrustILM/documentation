---
sidebar_position: 2
---

# Testing

Testing of the platform is layered: fast checks run in each repository's CI on every change, end-to-end tests verify the deployed platform, and the integrated build is verified before each release. This page describes the individual test types.

| Test type | What it verifies | When it runs |
|---|---|---|
| **Unit tests** | Behavior of individual classes and methods within a component | Every pull request and commit, in the repository's CI |
| **Code quality analysis** | Code quality and maintainability of the change | Every pull request, in the repository's CI |
| **Smoke tests** | Critical user flows end-to-end on a deployed platform | On pull requests |
| **API tests** | API contracts of the platform per the OpenAPI specifications | On schedule against a deployed platform |
| **Flow and regression tests** | Complete functional flows of the platform | Daily against the default branch, and before release |
| **Automated security testing** | Static analysis, dependency, and secret scanning of source and published artifacts | Every change, on schedule, and before publication; dependency monitoring is continuous |

## Unit testing

Unit tests verify the functionality of each microservice at the level of individual classes and methods. They are written by the developer implementing the functionality and run automatically on every pull request and commit.

Because a microservice often depends on other services, unit tests isolate the code under test by mocking external dependencies (*solitary* unit tests). Unit tests must be independent of each other, deterministic, descriptive in naming, and should cover both normal and exceptional scenarios.

## Code quality analysis

Every pull request passes automated static analysis of code quality — style, complexity, and maintainability — as part of the repository's CI.

## Smoke testing

A small suite of end-to-end tests covering the critical user flows — such as logging in, issuing a certificate, or generating a key — runs against a fully deployed platform. Smoke tests give fast feedback that the integrated platform works at all: they run against ephemeral preview environments created for each pull request.

Smoke tests are deliberately few and fast — they are a gate for obvious breakage, not a substitute for the deeper test types below.

## API testing

API tests verify the contracts of the platform per the published OpenAPI specifications, from both directions:

- **Core producer API** — the API the platform exposes to clients. Tests request the API endpoints and evaluate the responses, with connector functionality mocked.
- **Core consumer API** — the API contract between the platform and connectors. Tests verify the platform handles all attribute and response variants a conforming connector may produce, with the connector itself mocked.

API tests run on schedule against an environment deployed and loaded with defined test data for the run, and destroyed afterward. They must cover the endpoints with their inputs, outputs, and side effects, and be independent and deterministic.

## Flow and regression testing

Flow tests verify complete end-to-end functionality of the platform — scenarios such as certificate inventory management from upload through status changes to deletion. Each flow deploys the set of services it requires, loads its test data, and tears the environment down afterward; components outside the tested flow, including connectors and third-party services, are mocked.

Flow tests accumulate into the **regression suite**, which runs on a daily schedule against the default branch and — together with the smoke suite — against the integrated build before each release, so previously delivered functionality is verified not to have broken.

## Automated security testing

Beyond the checks above, each repository runs the following automated security checks:

- **Static application security testing (SAST)** of source code for security weaknesses, on every change and again on a recurring schedule; a failing result blocks the change.
- **Dependency vulnerability monitoring**, continuously tracking known vulnerabilities (CVEs) in third-party dependencies; findings are handled under [Vulnerability Management](../vulnerability-management.md).
- **Secret detection**, scanning every push for committed credentials and keys; a match blocks the change.
- **Vulnerability and secret scanning of every published artifact**, before it is made available; a failing result blocks publication.

Each of these checks is defined and enforced as configuration in its repository.
