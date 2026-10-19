---
sidebar_position: 2
---

# Contribution and Change

This page describes how a change travels from an idea to the default branch. It is an overview — the practical, step-by-step instructions are in the [Contributing to ILM](https://github.com/OmniTrustILM/.github/blob/main/CONTRIBUTING.md) guide, and the [developer guides for the platform internals](../contributors/overview.mdx) live in a separate section.

## How a change flows

1. **Issue** — every change starts as an issue in the relevant repository, created from pre-defined templates. The issue captures the problem or requirement, its context, and — after triage — its target version and, for work that adds or changes functionality, its acceptance criteria. Reporting a vulnerability has its own rules — see [Vulnerability Management](./vulnerability-management.md).
2. **Branch** — development follows [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow): a branch off the default branch carries only the change belonging to its issue, built in the [local development environment](../contributors/development-environment.md).
3. **Pull request** — the change is submitted as a pull request linked to its issue; automation tracks the issue's progress from the pull request lifecycle.
4. **Review and merge** — the change is verified against its acceptance criteria and approved by someone other than its author before merge, and the pull request is merged once it is reviewed, accepted, and its required checks pass; see *Who reviews what* below.

## License and sign-off

The project is licensed under Apache-2.0. Every commit must carry a Developer Certificate of Origin sign-off, verified by an automated check.

## Who reviews what

Every pull request is reviewed under the [Quality and Review](./quality-and-review/overview.md) policy before it is merged. Approval must come from someone other than the author, and an owner of the affected code is a required reviewer. Approval lapses whenever new commits are pushed, and unresolved review comments block acceptance.

### Enforced branch controls

Beyond review, each repository's default branch enforces:

- No direct pushes.
- No force pushes.
- No branch deletion.
- No merge against a stale base.
- No merge while a required check is failing — the checks themselves are enforced configuration declared by the repository.
- Merges are squashed.
- Bypassing these protections is restricted to a named team.

The full rule set is active on every repository that builds a released platform component; supporting repositories carry a reduced baseline and are being brought in line. Any repository's rules are publicly inspectable.

## Conventions

- **Commits** follow a shared format: an imperative, capitalized summary of at most 50 characters, a blank second line, an optional body wrapped at 72 characters, and a link to the related issue — see the [commit guidelines](https://github.com/OmniTrustILM/.github/blob/main/CONTRIBUTING.md#commit-guidelines).
- **Versioning** follows [Semantic Versioning](https://semver.org) — see [Release, Versioning and Support](./release-versioning-and-support.md).

## Contributing

Contributions are welcome from anyone, not only the maintainers.

The controls described throughout this page apply to every change regardless of who authors it. In particular, [DL-04 Independent approval](./controls-and-evidence.md#dl-04) means nobody approves their own change — maintainers included.

One exception is deliberate: bypassing the branch protections described above is restricted to a named team. It exists on purpose, so the project cannot be locked out of its own repositories. The rule set of any repository shows who holds it.

- Check the existing issues first to avoid opening a duplicate.
- Comment on an issue you intend to work on, to avoid duplicated effort.
- Issues suitable for newcomers are labeled as good first issues.
- A pull request submitted without a linked issue is not rejected — the maintainers create the issue retroactively so the change enters the normal flow.
