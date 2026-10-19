---
sidebar_position: 6
---

# Release, Versioning and Support

This page describes how releases are planned and published, how versions are numbered, and what users can expect from supported versions.

## Release cadence

The project has adopted a quarterly cadence for feature releases — four planned releases per year — effective from the next release cycle. Between feature releases, patch releases are published as needed; see *Patch releases* below.

## Versioning

Versioning follows [Semantic Versioning](https://semver.org) (`MAJOR.MINOR.PATCH`):

| Release type | Version bump | Delivers |
|---|---|---|
| Major release | `MAJOR` | Breaking changes |
| Feature release | `MINOR` | New features and enhancements |
| Patch release | `PATCH` | Security patches and bug fixes only |

Pre-release identifiers may be used for release candidates.

## Scope

A release's scope is bounded by two gates, in order:

- **Epic freeze** — locks the set of epics in the release. An epic proposed after this point queues for the next release; work inside the epics already admitted continues.
- **Feature freeze** — ends development of the release scope. After this point, only fixes land, and stabilization begins.

Each epic considered for a release is classified into a committed tier or an optional tier. Under pressure, the optional tier is descoped first; risk to committed scope forces an explicit decision rather than a silent slip. Work that cannot be completed in the current cycle moves to the next release.

## Verification and sign-off

See [Quality and Review](./quality-and-review/overview.md) and [Testing](./quality-and-review/testing.md) for how the platform is tested and reviewed. A release ships only once its sign-off criteria are met:

- Smoke and regression tests pass on the integrated build.
- No critical defect remains open.
- Accepted known issues are recorded with their rationale and carried to the next release.

## Publication

A platform release identifies the set of component versions released and tested together. Publication tags a version on each participating repository, so every artifact traces to the exact source revision it was built from.

Release notes are generated from the labels of the pull requests merged into the release, grouped into new features, enhancements, bug fixes, security, performance, QA and testing, documentation, dependencies, and other.

## Patch releases

Patch releases are published as needed between feature releases and are not bound by the scope gates above. A patch release carries only security patches and bug fixes — never new features — and is cut from the most recent feature release in the affected MAJOR line. Critical bugs and security vulnerabilities are the typical triggers; lower-risk fixes may be batched — see [Vulnerability Management](./vulnerability-management.md).

After a major release, both active MAJOR lines receive patch releases until the older line is retired.

## Compatibility and deprecation

- Feature and patch releases are backward compatible; breaking changes are reserved for major releases.
- Compatibility impact and migration steps are described in the release notes of the release that introduces them.
- Functionality planned for removal is deprecated and communicated before it is removed.

## Supported versions

A defect found in an older minor version is fixed by a patch release of the current latest feature release in that MAJOR line. Users are encouraged to stay on the latest feature release and apply its patch releases as they are published.

Defects found in released versions are reported as issues in the affected repository; see [Contribution and Change](./contribution-and-change.md) for how issues are handled.
