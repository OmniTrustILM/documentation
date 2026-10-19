# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Documentation site for ILM (Identity Lifecycle Management) — an open-source trust lifecycle management platform. Built with **Docusaurus 3.7** and deployed to GitHub Pages at https://docs.otilm.com.

## Commands

```bash
yarn install                # Install dependencies
yarn start                  # Dev server at http://localhost:3000
yarn build                  # Production build to ./build (NODE_OPTIONS="--max_old_space_size=4096")
yarn serve                  # Serve production build locally
yarn clear                  # Clear Docusaurus cache
yarn render-diagrams        # Render all PlantUML diagrams to static/img/plantuml/ (also runs automatically on start/build)
yarn fetch-api-specs        # Download the OpenAPI documents (also runs automatically on start/build)
yarn copy-scalar-runtime    # Vendor the Scalar bundle (also runs automatically on start/build)
yarn verify-api-build       # Check ./build has every API page, document and runtime, and that links resolve
yarn verify-controls        # Check the control catalog and standards mapping agree (also runs on build)
yarn update-api-anchors     # Rewrite diagram operation links to the fragments Scalar serves
yarn test                   # Run unit tests (node --test)
yarn coverage               # Unit tests with coverage thresholds enforced
```

> **Prerequisite:** `yarn start` and `yarn build` render all PlantUML diagrams at build time through a pinned
> `plantuml-server` Docker image, so a running **Docker daemon is required**. `yarn build` renders up-front via the
> `prebuild` hook; `yarn start` renders via the `plantumlRenderPlugin` Docusaurus lifecycle plugin, which also
> re-renders diagrams live as docs change during dev. To render against an already-running server instead, set
> `PLANTUML_SERVER_URL` (e.g. `PLANTUML_SERVER_URL=http://127.0.0.1:8080 yarn build`).

The build downloads 52 OpenAPI documents from `https://api.otilm.com/` into `static/api-specs/`, so it
is network-dependent. They are **not** rendered at build time — Scalar renders them in the browser.

**Build memory is no longer dominated by the API reference.** Redocusaurus used to server-render every
operation of every document during static generation, costing ~175 MB of peak heap per document: with
48 documents the build peaked at ~9.5 GB, against a ~1.1 GB baseline with no documents at all. Since
the switch to Scalar the cost is close to that baseline — with all 52 it peaks at ~3.3 GB and the
bundling and generation phases take under 30 s, and it succeeds with a heap limit as low as 3072 MB.
Adding an API is now an ordinary catalog change, not a build-infrastructure decision.

A *cold* wall-clock build is much longer than that, because `prebuild` renders every PlantUML diagram
through Docker; only diagrams whose source changed are re-rendered, so a warm build skips it.

The heap limit is set in two places that must stay in sync: the `NODE_OPTIONS` above and
`.github/workflows/documentation.yml`. It is 4096 MB — headroom over the 3072 MB that was measured to
work. If a release makes the build fail with a `SIGABRT` heap-limit crash (which reads like CI
infrastructure flakiness), raise both together after confirming with one cold build:
`yarn clear && NODE_OPTIONS=--max_old_space_size=<limit> yarn build`.

### Remote docs (five synced sets)

These directories are **not authored here**. `docusaurus-plugin-remote-content` downloads them from their source repositories at a pinned ref, so local edits are overwritten on the next download — fix errors upstream.

| Target directory | Source repository and path | Pin | Download command |
|---|---|---|---|
| `docs/certificate-key/installation-guide/deployment/deployment-helm/` | `OmniTrustILM/helm-charts` `charts/ilm/docs/` | `chartVersion` | `yarn docusaurus download-remote-helm-docs` |
| `docs/certificate-key/installation-guide/deployment/deployment-operator/` | `OmniTrustILM/operator` `docs/site/` (the five journey pages) | `operatorDocsRef` | `yarn docusaurus download-remote-operator-docs` |
| `docs/certificate-key/installation-guide/deployment/deployment-operator/custom-resources/` | `OmniTrustILM/operator` `docs/site/custom-resources/` (the four CR guides) | `operatorDocsRef` | `yarn docusaurus download-remote-operator-cr-docs` |
| `docs/certificate-key/cli/` | `OmniTrustILM/cli` `docs/site/` | `cliDocsRef` | `yarn docusaurus download-remote-cli-docs` |
| `docs/contributors/development-environment.md` | `OmniTrustILM/development-environment` `docs/site/` | `devenvDocsRef` | `yarn docusaurus download-remote-devenv-docs` |

The two operator entries share `operatorDocsRef` and are always re-pinned together. The `_category_.json` in each target directory **is** authored here — it is not in any `documents` array, so a download never touches it.

The operator, cli and devenv pages follow two rules, enforced upstream: every page carries `sidebar_position` front matter, and links are relative within the synced set (same-directory, or one level between `docs/site/` and `docs/site/custom-resources/` in the operator set) — everything else is an absolute URL. (The helm set predates both rules and carries no front matter.) `markdown.hooks.onBrokenMarkdownLinks` is `'throw'`, so a link violation fails `yarn build` rather than printing a warning nobody reads.

> **The helm set is pinned behind its fix.** `charts/ilm/docs/overview.md` carried a link out of its own directory (`../../messaging-rabbitmq`), which was hand-patched here after a sync — the exact failure mode the `'throw'` flip exists to prevent. The upstream fix is merged on `helm-charts` `main` but is **not** in the `2.19.0` tag that `chartVersion` pins, so `download-remote-helm-docs` must not be re-run until `chartVersion` advances. If it is, the build now fails loudly instead of regressing silently.

> **The three new pins are merge commits, not tags.** `operatorDocsRef`, `cliDocsRef` and `devenvDocsRef` name the merge commits that first published each synced set, because none of the three repositories has cut a release containing its docs yet. The operator and cli release runbooks move them to `v` + `operatorVersion` / `v` + `cliVersion` at the next release. `cli/commands.md` is generated upstream by `make docs` — never edit it here.

## Architecture

### Documentation Structure

All docs live in `/docs` and are organized into two major domains:

- **`certificate-key/`** — PKI: certificate management, key management, connectors, protocols (ACME, CMP, SCEP), deployment, integrations (ADCS, EJBCA, HashiCorp Vault, Keycloak, Intune)
- **`signing/`** — Digital signatures: AdES formats (PAdES, CAdES, XAdES, JAdES, ASiC), validation, HSM integration (nShield, Utimaco, Trident), CSC component
- **`contributors/`** — Developer/contributor guides
- **`community/`** — Community resources

Sidebar is auto-generated from the filesystem (`sidebars.js` uses `autogenerated`). Page ordering is controlled by `sidebar_position` in MDX front matter.

### Custom Remark Plugins (`src/plugins/`)

- **`remarkFindReplacePlugin.mjs`** — Replaces `%API_BASE_URL%` with `https://docs.otilm.com/api/` in all doc content. Use `%API_BASE_URL%` when linking to API docs within markdown.
- **`remarkSimplePlantumlPlugin.mjs`** — Rewrites fenced `plantuml` code blocks into `<img>` tags pointing at build-time-rendered static SVGs in `static/img/plantuml/<hash>.svg`. The SVGs are produced by `scripts/render-diagrams.mjs`.

### API Documentation

52 OpenAPI documents are published at `/api/<id>` and rendered by **Scalar**. Everything is driven from
one catalog, `src/data/apiCatalog.mjs`, which lists each API as an `[id, label]` row inside a group.
That single list generates the routes **and** the navbar menus — there is no second place to update.

**To add an API:** add a row to the right group. The document URL defaults to
`https://api.otilm.com/<apiVersion>/doc-openapi-<id>.yaml` and the route to `/api/<id>`. Add a third
element only when the document is named differently (`core-key` is the one such case). A group with a
single entry renders as a plain navbar link, a group with several as a dropdown.

Versions and the remote-content pins live in `src/data/versions.mjs`:
- `apiVersion` — core, connector, messaging and protocol documents
- `chartVersion` — Helm chart (used by `docusaurus-plugin-remote-content`)
- `cscVersion` — CSC component, versioned independently
- `operatorVersion`, `cliVersion` — substituted into docs as `%OPERATOR_VERSION%` / `%CLI_VERSION%`
- `operatorDocsRef`, `cliDocsRef`, `devenvDocsRef` — immutable refs for the synced doc sets

**How it fits together.** `src/plugins/scalarApiPlugin.mjs` runs in `loadContent`, which Docusaurus
completes before it configures the bundler that copies `static/` — so the plugin can materialize
assets there. It downloads every document to `static/api-specs/<version>/<id>.yaml` and vendors the
Scalar bundle to `static/scalar/standalone-<version>.js`. Both directories are generated and
gitignored. Documents are validated on download (a `200` carrying an HTML error page or truncated
YAML fails the build), and each page's `<title>` and description come from the document's `info`
block, so they match what Redoc produced.

Scalar renders **in the browser**. Nothing parses an OpenAPI document during static generation, which
is what keeps the build cheap — but it also means a mistake surfaces as a blank page at runtime
rather than a build error. `yarn verify-api-build` is the guard: it checks that every one of the 52
pages, every document and the runtime actually landed in `build/`. Note that `onBrokenLinks` cannot
do this job — `%API_BASE_URL%` expands to an absolute URL, which Docusaurus treats as external.

### Linking to the API reference

Two syntaxes are in use, and both must follow the same three rules:

```
[Update OAuth2 provider settings](/api/core-other#tag/settings/PUT/v1/settings/authentication/oauth2Providers/{providerName})

skinparam topurl /api/
    Client -> Core [[core-authority#tag/authority-management/POST/v1/authorities]]: Add Authority
```

1. **No trailing slash after the id.** The site publishes `/api/core-other`; `/api/core-other/` is a
   404. This applies to plain page links too — `](/api/core-auth/)` is broken, `](/api/core-auth)`
   is not.
2. **Diagrams use `skinparam topurl /api/`**, never an absolute URL and never `%API_BASE_URL%`. The
   base has to be site-relative or the link drags a reader on localhost over to production; and the
   placeholder is never expanded in a diagram, because `render-diagrams.mjs` reads raw markdown and
   the remark replacement only touches page content.
3. **Fragments are Scalar's**, `tag/<tag-slug>/<METHOD>/<path>`, not Redoc's
   `operation/<operationId>`. The tag slug lowercases, hyphenates spaces and *drops* punctuation
   (`Statistics/Dashboard` becomes `statisticsdashboard`). A whole tag section is just `tag/<slug>`.

Don't hand-write a fragment. Write the link against an operationId in either syntax and run
`yarn update-api-anchors`; it derives the right fragment from the downloaded document, fixes the
trailing slash, and is idempotent.

`yarn verify-api-build` enforces all three: it fails on a trailing slash, on a non-relative diagram
base, on an id the catalog does not publish, and on a fragment the document does not offer. So an
API release that renames or moves an operation breaks the build instead of leaving a dead link.
Docusaurus checks fragments on markdown links itself, but it cannot see inside a rendered diagram,
and it only knows the fragments a page declares — which is why both checks exist.

**Why the API pages declare their fragments.** Docusaurus' broken-anchor check reads the fragments
present in a page's *server-rendered* HTML. Scalar creates them in the browser, so an API page
appears to have none and every link into an operation would be reported broken. The route component
therefore calls `useBrokenLinks().collectAnchor()` for each fragment its document actually offers,
supplied per route by `scalarApiPlugin` from the downloaded document. Only real fragments are
declared, so a link to an operation that does not exist is still reported.

The reference is deliberately read-only, matching Redoc: Scalar's API client, "Test Request", the
Developer Tools bar, the AI agent and telemetry are all disabled in `src/lib/scalarConfig.mjs`.
`src/css/scalar.css` maps Infima's theme onto Scalar's variables. One Infima quirk to know: in light
mode `--ifm-background-color` is `transparent`, not white, so a `var(..., #fff)` fallback never fires
and opaque surfaces must be set explicitly.

### Custom React Components (`src/components/`)

TSX components used on the homepage and in docs: `HomepageFeatures`, `PlatformModules`, `WhatIsILM`, `CardLink`, `Divider`.

### Key Configuration

- `docusaurus.config.js` — Main config: plugins, presets, navbar, Algolia search, theme
- `src/data/apiCatalog.mjs` — The published APIs; generates both the `/api/*` routes and the navbar menus
- `src/data/versions.mjs` — component versions and the remote-content sync pins
- `sidebars.js` — Auto-generated sidebar config
- Syntax highlighting includes: PowerShell, Java, HCL, Scala, Bash (via Prism)
- `onBrokenLinks: 'throw'` — Build fails on broken internal links

## Writing Documentation

- Docs use **MDX** (JSX in Markdown) — `.md` and `.mdx` extensions both work
- Use `%API_BASE_URL%` placeholder to reference API documentation URLs
- PlantUML diagrams: use fenced code blocks with language `plantuml`
- The `documentation` branch is the main/default branch for this repo
- Prose uses **US English** (`behavior`, `finalize`, `synchronized`)

### Naming the product

Write **"the platform"**, not the brand name, wherever a functional term works — "the platform validates the request", not "ILM validates the request". A page may name the product once where it genuinely introduces it (a section intro, a GitHub link label); everywhere else the brand name is churn waiting for the next rename. Never coin compound names like "ILM Core" — the component is `Core`. The same applies inside diagrams: participants are `Core`, `Platform`, `Connector`.

### Diagrams

Rendered PlantUML SVGs scale down to the content column (`img[src^="/img/plantuml/"]` in `src/css/custom.css`), so a wide diagram no longer overflows — but it renders small. Keep a diagram under roughly 1000px natural width: wrap long message labels with `\n`, stack multi-word participant names, and split a diagram that outgrows that rather than letting it shrink. To check a diagram's rendered width, run `yarn render-diagrams` and read the `width:` value from its SVG in `static/img/plantuml/`.

Within a diagram, keep message labels consistent with each other and with the page's prose: sentence case for actions (`Validate certificate`, not `validate certificate`), and the same component names the surrounding text uses.

### Integration Guides

Each integration lives in its own directory under `docs/certificate-key/integration-guides/<technology>/`:

- A `_category_.json` sets the sidebar `label`, an explicit `position` (integrations are ordered by product, not alphabetically), and a `link` of type `doc` pointing at the entry page
- Multi-page guides use `overview.md` as that entry page, with a step table linking to one page per task; single-page guides use `integration-guide.md`
- Page order inside the directory comes from `sidebar_position` in the front matter, with the overview at position 1
- Guides describe what to configure in the third-party product and in the platform. Deploying the connector itself belongs in the installation guide, not here
- Prefer naming entities and their attributes over navigation paths — product menus change more often than the concepts do

### Development Lifecycle section

The section has three layers: narrative pages that describe how work is done, the control catalog in `controls-and-evidence.md`, and the mapping to external frameworks in `standards-mapping/` — an overview page holding the requirement themes, plus one page per framework. They are kept separate so that a change in practice touches the narrative and at most one control row, never the mapping, and so that adding a standard is a new framework page and a linked entry in the overview, not a change to the themes.

**The catalog is a second surface for every claim the narrative pages make.** If a control row says something the narrative does not, or says it more strongly, the section contradicts itself and a reader comparing the two loses confidence in both. Change a page and its control row together.

**`DL-nn` identifiers are append-only** — never renumbered, never reused, because auditors cite them. A definition is a table row in `controls-and-evidence.md` whose first cell is the identifier, emphasized; a reference is an identifier cited in the mapping's Controls column. `yarn verify-controls` runs in `prebuild` and fails the build on a dangling reference, an orphan control, or a duplicate definition. It also reads the overview's gate table and fails on a `DL-nn` citation there that the catalog does not define — but only a citation in the mapping's own Controls column clears the orphan check, so citing a control in the overview alone still leaves it orphaned.

**Within the section, product and tool names never appear; formats, standards and verification interfaces always do** — SPDX, SLSA, Sigstore and `cosign`, CVE, CWE, OWASP, Semantic Versioning. The test: would replacing this with a competitor change the meaning for the reader? If yes it is a format and gets named; if no it is a tool and does not.

A control's evidence follows the same logic: it names the configuration that enforces it — a repository's rule set, a workflow definition — not the product that implements it, because that configuration is public, authoritative and current, and it names its own current tools. So the documentation stays true when a tool is replaced.

**Paragraphs in the section's narrative pages are single lines in the source**, matching the rest of the site, not hard-wrapped at a fixed column; a line break belongs only between an actual block — a paragraph, list item, or table row — never inside one.

A few facts were wrong in earlier drafts; nobody should reintroduce them:

- The build emits **SPDX** bills of materials, not CycloneDX. CycloneDX appears elsewhere in the organization as a product feature for cryptographic bills of materials — a different thing.
- **CVSS is not used.** Severity is assessed on impact, exploitability and exposure; do not name a scoring framework.
- **Signing coverage differs by repository** — some sign each published file, others sign the checksum manifest. Write that each release publishes checksums and signatures alongside its artifacts, never that every artifact is signed.
- Automated dependency **security updates are not universal** across repositories, so do not claim them as a single mechanism.

Only what is enforced and evidenced belongs in the section. Date an adopted target but not a settled fact — the quarterly release cadence is adopted and effective from the next release cycle, not an established rhythm. Scope claims by criterion rather than by list, so they do not rot as repositories are added: the full rule set is active on every repository that builds a released platform component. Describe where advisories appear rather than asserting that any exist, and say nothing about penetration testing, dynamic security testing or independent external security assessment, in either direction.

Two traps to know before editing. The retired `/docs/qa-strategy/*` URLs are intentionally **not** redirected. And pages under `quality-and-review/` and `standards-mapping/` sit one level deeper than the pages they replaced, so relative links out of those directories need one more `../` than a page directly under the section.

## CI/CD

GitHub Actions workflow (`.github/workflows/documentation.yml`):
- **On PR to `documentation`**: runs `yarn install --frozen-lockfile && yarn build` as a check
- **On push to `documentation`**: builds and deploys to GitHub Pages
