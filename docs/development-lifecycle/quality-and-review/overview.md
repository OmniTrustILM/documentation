---
sidebar_position: 1
---

# Quality and Review

This page is the Quality and Review policy of the platform: it defines the goals, scope, and principles of quality assurance and the review controls every change passes through. The concrete test types and where they run are described in [Testing](./testing.md).

## Goals

Quality assurance of the platform aims to:

- meet industry quality standards and expectations,
- ensure the platform delivers the required security, performance, and availability,
- identify and fix issues as early — and therefore as cheaply — as possible,
- monitor quality continuously during development, not only before a release,
- build a robust, automated testing framework,
- provide reports and metrics about the quality of the platform.

## Scope

The platform is composed of core components (microservices), connectors, and user interfaces. It follows a microservices architecture, built to cloud-native principles; see [Concept overview](../../certificate-key/concept-design/overview.md) for the platform's architecture.

**In scope** of the Quality and Review policy are:

- **Core components** — the mandatory services that provide the platform's functionality and logic. See [Concept overview](../../certificate-key/concept-design/overview.md).
- **Connector APIs** — the OpenAPI contracts between the platform and connectors. See [Connectors](../../certificate-key/connectors/overview.md).
- **User interfaces** — the web-based and CLI interfaces used to interact with the platform. See [Interfaces](../../certificate-key/concept-design/architecture/interfaces.md).

**Out of scope** are the connectors' internals: connectors are independently implementable, so their internals are not under the platform's control. Testing exercises the connector interfaces with the connector itself mocked.

## Principles

- **Test early and often** — testing runs throughout development, not as a phase at the end. Most checks are automated and run on every change.
- **Layered testing** — fast, cheap checks (build, unit tests, static analysis) run in each repository's CI on every change; end-to-end verification runs against a deployed platform; regression and release verification run on the integrated build. Each layer catches what the cheaper layers below it cannot.
- **Test in isolation** — test environments are deployed and configured by automation, loaded with defined test data, and torn down afterward, so results are reproducible and deterministic.
- **Production-like verification** — before release, the integrated platform is verified in an environment as close as possible to production.
- **Proportionality** — testing effort scales with the impact and risk of the change.

## Code review

Every code change is reviewed before it is merged. The approval must come from someone other than the author, and an owner of the affected code is a required reviewer. Approval lapses whenever new commits are pushed to the change, and unresolved review comments block acceptance. The review has two complementary dimensions:

**Quality review** verifies that the change does what it intends and keeps the codebase maintainable: adherence to coding conventions, modularity, proper exception handling and logging, resolved comments, and unit tests for the changed code. Each repository declares its own quality gate as enforced configuration, and a change that fails it cannot be accepted.

**Security review** verifies that the change follows secure coding guidelines: input validation, secure authentication and session handling, correct use of cryptography, and protection against the [OWASP Top 10](https://owasp.org/www-project-top-ten/) vulnerability classes. Static analysis of the source code runs automatically on every change and complements the human review.

Beyond review, each repository's default branch enforces further controls, described in [Contribution and Change](../contribution-and-change.md).

## Reporting and maintenance

- Test runs produce reports automatically — results, execution time, and failure details are attached to the workflow that executed them. A failed run is marked failed and notifies the maintainers, and a confirmed defect is filed as an issue in the affected repository.
- Tests are maintained alongside the code: they are updated in the same change when functionality changes intentionally, and removed when the functionality they cover is removed.
