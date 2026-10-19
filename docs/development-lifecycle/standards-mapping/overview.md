---
sidebar_position: 1
---

# Standards Mapping

The platform is software, not a service. Schemes such as eIDAS and the ETSI trust-service standards, the PCI standards, ISO/IEC 27001 and SOC 2 certify an *operator*, not a software product — so this page makes no claim of certification or conformity. What it does is say, requirement by requirement, which of a deployer's obligations the platform's own development discharges evidentially, and which remain theirs.

## How to use this page

Find your framework in the list below. Follow its requirement groups to the themes to see what the platform's development discharges and what remains yours. Follow a theme's controls to the evidence and where to inspect it.

## Framework index

- [ISO/IEC 27001:2022 Annex A](./iso-27001.md) — the international standard for an information security management system, certified for an organization rather than a software product.
- [NIST SP 800-218 (SSDF) v1.1](./ssdf.md) — NIST's Secure Software Development Framework, a set of practices for producers of software.
- [Regulation (EU) 2024/2847 (Cyber Resilience Act)](./cyber-resilience-act.md) — the EU regulation setting cybersecurity requirements for products with digital elements, addressed to their manufacturer.
- [PCI Software Security Framework, Secure SLC Standard](./pci-secure-slc.md) — the PCI standard for a software vendor's secure development lifecycle.
- [ETSI EN 319 401](./etsi-en-319-401.md) — general policy and security requirements for trust service providers.
- [SOC 2 Trust Services Criteria](./soc-2.md) — the AICPA criteria a service organization's controls are evaluated against in a SOC 2 examination.

## Requirement themes

### T1 — Documented and applied lifecycle \{#t1}

**Discharged by the platform's development.** The lifecycle is published, applies to every contribution, and the records the control catalog marks Public can be read without the project's involvement.

**Remains with the deployer.** Your own development or integration lifecycle, and your assessment of the project as a supplier.

**Controls**

- [DL-01 Published lifecycle](../controls-and-evidence.md#dl-01)
- [DL-25 Record retention](../controls-and-evidence.md#dl-25)

### T2 — Requirements and security criteria before implementation \{#t2}

**Discharged by the platform's development.** The work item records its purpose and, for work that adds or changes functionality, its acceptance criteria, and templates provide a section for security-relevant constraints before implementation begins.

**Remains with the deployer.** Requirements for how you configure, deploy and operate the platform.

**Controls**

- [DL-02 Work item and traceability](../controls-and-evidence.md#dl-02)
- [DL-12 Constraints and decomposition](../controls-and-evidence.md#dl-12)

### T3 — Design and analysis before implementation \{#t3}

**Discharged by the platform's development.** Work large enough to carry design risk is analyzed and decomposed under review before implementation begins.

**Remains with the deployer.** Design of your deployment topology, trust hierarchy and integrations.

**Controls**

- [DL-12 Constraints and decomposition](../controls-and-evidence.md#dl-12)

### T4 — Secure coding and code quality \{#t4}

**Discharged by the platform's development.** Static application security testing and a declared code-quality gate run on every change, and a change failing either cannot be accepted.

**Remains with the deployer.** Security and quality of any code you write against the platform's interfaces.

**Controls**

- [DL-08 Static security analysis](../controls-and-evidence.md#dl-08)
- [DL-09 Code quality gate](../controls-and-evidence.md#dl-09)

### T5 — Independent review before a change is accepted \{#t5}

**Discharged by the platform's development.** No change reaches a released component without approval from someone other than its author, including an owner of the affected code, with the required checks declared as enforced configuration.

**Remains with the deployer.** Review of your own configuration and deployment changes.

**Controls**

- [DL-04 Independent approval](../controls-and-evidence.md#dl-04)
- [DL-06 Declared required checks](../controls-and-evidence.md#dl-06)

### T6 — Automated security verification \{#t6}

**Discharged by the platform's development.** Source, commits and published artifacts are each scanned, with thresholds that block acceptance or publication.

**Remains with the deployer.** Scanning of your own images, infrastructure and configuration.

**Controls**

- [DL-08 Static security analysis](../controls-and-evidence.md#dl-08)
- [DL-10 Secret detection](../controls-and-evidence.md#dl-10)
- [DL-16 Artifact scanning](../controls-and-evidence.md#dl-16)

### T7 — Testing and acceptance \{#t7}

**Discharged by the platform's development.** Every change is built and tested and verified against its acceptance criteria before merge, the integrated platform is verified beyond the individual change, and a release passes declared sign-off criteria.

**Remains with the deployer.** Acceptance testing of the release in your own environment.

**Controls**

- [DL-07 Build and tests](../controls-and-evidence.md#dl-07)
- [DL-11 Integrated verification](../controls-and-evidence.md#dl-11)
- [DL-20 Release sign-off](../controls-and-evidence.md#dl-20)
- [DL-26 Acceptance verification](../controls-and-evidence.md#dl-26)

### T8 — Change control and traceability \{#t8}

**Discharged by the platform's development.** Every released line of code traces to a work item, a reviewed pull request, a signed-off commit and a release record.

**Remains with the deployer.** Change control over your deployment and configuration.

**Controls**

- [DL-02 Work item and traceability](../controls-and-evidence.md#dl-02)
- [DL-03 Pull-request-only path](../controls-and-evidence.md#dl-03)
- [DL-05 Commit sign-off](../controls-and-evidence.md#dl-05)
- [DL-06 Declared required checks](../controls-and-evidence.md#dl-06)
- [DL-20 Release sign-off](../controls-and-evidence.md#dl-20)

### T9 — Segregation of duties and least privilege \{#t9}

**Discharged by the platform's development.** An author cannot approve their own change, repository access is read by default with multi-factor authentication required, and conformance to the protection baseline is monitored.

**Remains with the deployer.** Segregation of duties among your own administrators and operators.

**Controls**

- [DL-04 Independent approval](../controls-and-evidence.md#dl-04)
- [DL-18 Access control](../controls-and-evidence.md#dl-18)
- [DL-19 Baseline monitoring](../controls-and-evidence.md#dl-19)

### T10 — Separation of development, verification and released code \{#t10}

**Discharged by the platform's development.** Development and per-change verification environments are kept separate from released code, and releases are built only by the pipeline.

**Remains with the deployer.** Separation of your own environments, including ensuring production runs only published releases.

**Controls**

- [DL-11 Integrated verification](../controls-and-evidence.md#dl-11)
- [DL-17 Pipeline integrity](../controls-and-evidence.md#dl-17)

### T11 — Third-party components and supply chain \{#t11}

**Discharged by the platform's development.** Dependencies are monitored and updated through reviewed changes, a bill of materials accompanies each release and each published image, and the pipeline pins the third-party actions it calls.

**Remains with the deployer.** Assessing the bill of materials against your policy, and any component you add yourself.

**Controls**

- [DL-13 Dependency monitoring](../controls-and-evidence.md#dl-13)
- [DL-14 Bill of materials and provenance](../controls-and-evidence.md#dl-14)
- [DL-17 Pipeline integrity](../controls-and-evidence.md#dl-17)

### T12 — Build and release integrity \{#t12}

**Discharged by the platform's development.** Artifacts are built only by the pinned pipeline, scanned before publication, signed, and accompanied by provenance.

**Remains with the deployer.** Verifying signatures and provenance before you deploy, and the integrity of your own pipeline.

**Controls**

- [DL-14 Bill of materials and provenance](../controls-and-evidence.md#dl-14)
- [DL-15 Artifact signing](../controls-and-evidence.md#dl-15)
- [DL-16 Artifact scanning](../controls-and-evidence.md#dl-16)
- [DL-17 Pipeline integrity](../controls-and-evidence.md#dl-17)
- [DL-20 Release sign-off](../controls-and-evidence.md#dl-20)

### T13 — Vulnerability handling and disclosure \{#t13}

**Discharged by the platform's development.** A published private intake with committed response times, severity assessment, remediation through the normal controls, and disclosure identifying affected versions.

**Remains with the deployer.** Monitoring advisories, and your own vulnerability handling.

**Controls**

- [DL-13 Dependency monitoring](../controls-and-evidence.md#dl-13)
- [DL-22 Vulnerability intake](../controls-and-evidence.md#dl-22)
- [DL-23 Assessment and disclosure](../controls-and-evidence.md#dl-23)

### T14 — Security updates and supported versions \{#t14}

**Discharged by the platform's development.** Fixes ship as patch releases carrying only fixes, so a security fix can be adopted without taking new functionality.

**Remains with the deployer.** Applying updates within your own change windows, and staying on a supported version.

**Controls**

- [DL-21 Patch releases](../controls-and-evidence.md#dl-21)
- [DL-23 Assessment and disclosure](../controls-and-evidence.md#dl-23)

### T15 — Accountability for assisted development \{#t15}

**Discharged by the platform's development.** AI assistance relaxes no control, and every change carries a named human author and an independent reviewer who approves it, both accountable for it.

**Remains with the deployer.** Your own policy for assisted development.

**Controls**

- [DL-24 Assisted-development accountability](../controls-and-evidence.md#dl-24)

## Using this page in an audit

Cite the control identifiers — they are stable and never reused — and follow the evidence column of [Controls and Evidence](../controls-and-evidence.md) for each one. Everything marked public there can be inspected without contacting the project.

A framework not indexed here asks for the same themes in different words. The control catalog answers it directly, and an index entry will be added on request.
