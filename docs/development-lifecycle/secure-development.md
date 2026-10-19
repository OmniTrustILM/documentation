---
sidebar_position: 4
---

# Secure Development

This page describes how security is built into development itself: the practices a change is written under, the controls the repositories and infrastructure enforce, and how AI-assisted changes are handled. [Supply Chain](./supply-chain.md) covers what happens once a change is built and published — dependencies, bills of materials, and signing.

## Security through the lifecycle

Security activity runs alongside development rather than forming a separate phase:

| Phase | Security activity |
|---|---|
| Planning and requirements | Work item templates provide a section for security and compliance constraints. |
| Implementation | Static analysis of source code and secret detection run on every change. |
| Release | Published artifacts are scanned before publication, and no critical defect remains open at [release sign-off](./release-versioning-and-support.md#verification-and-sign-off). |
| Operation | Reported vulnerabilities are triaged and remediated — see [Vulnerability Management](./vulnerability-management.md). |

## Secure coding

Secure coding practice is enforced across repositories:

- Each repository follows the conventions of its language, and declares the checks a change must pass as enforced configuration.
- Static analysis of source code runs on every change and again on a recurring schedule, with declared severity thresholds that block acceptance, as part of [Automated security testing](./quality-and-review/testing.md#automated-security-testing).
- Every change also receives the security review described under [Code review](./quality-and-review/overview.md#code-review).

## Development infrastructure

The repositories themselves, and access to them, are protected as follows:

- Multi-factor authentication is required of everyone with access to the source repositories.
- Default repository permission is read; write and administrative access are granted explicitly.
- The default branch's protections are enforced configuration rather than convention — see [Enforced branch controls](./contribution-and-change.md#enforced-branch-controls).
- A push carrying a secret is refused — see [Testing](./quality-and-review/testing.md#automated-security-testing) for secret detection.
- Conformance of every repository to the required protection baseline is monitored continuously, and drift is raised publicly as an issue.

## AI-assisted development

AI assistance is used in development. An AI-assisted change follows no separate path: it passes through the same issue, the same independent review by someone other than the author, the same automated checks, and the same commit sign-off as any other change. No control is relaxed: a named human author, together with the independent reviewer who approves the change, is accountable for it.
