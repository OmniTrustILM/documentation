---
sidebar_position: 4
---

# GitOps

The CLI is a client, never a second control plane. Mutations flow through the
operator's CRDs. `generate`, `--dry-run`, and `-o yaml` keep everything declarative
and Git-friendly.

## Generate and commit

```console
$ ilmctl platform generate \
    --profile managed-ha \
    --db-mode managed \
    > platform.yaml
$ git add platform.yaml && git commit -m "add ilm platform"
# Argo CD / Flux syncs platform.yaml, or apply directly:
$ kubectl apply -f platform.yaml
```

`generate` writes to stdout by default. The output includes comments showing the
effective value for each configurable field and its source (`flag`, `profile`, or
`default`), so the committed file is self-documenting.

You can also apply in one step:

```console
$ ilmctl platform generate --profile managed-ha --db-mode managed --apply
```

## Server-side apply and field-manager conflicts

`init`, `upgrade`, `platform apply`, and `platform edit` use server-side apply
with the field manager `ilmctl`. When Argo CD or Flux (or another field manager)
already owns a resource, the CLI prints a conflict warning and steers you toward
the GitOps path — regenerate → commit — rather than fighting ownership. If you
intentionally want `ilmctl` to take ownership, pass `--force-conflicts`.

## Dry-run

`apply`, `init`, `upgrade`, `delete`, and `edit` accept `--dry-run=client|server`
(absence means perform the action). `platform generate --dry-run=server` validates
the rendered CR against the API server (CEL validation) without persisting it.

## Connector and Proxy CRs

Connector and Proxy CRs are generated the same way:

```console
$ ilmctl connector generate \
    --name my-connector \
    --platform-url https://ilm.example.com \
    --auth-type certificate \
    > connector.yaml

$ ilmctl proxy generate \
    --config-token-secret proxy-config \
    > proxy.yaml
```

Both commands support `--apply` and `--dry-run=server`. Note that a generated
`Connector` CR registers against a **running platform instance**; until
that platform is reachable the registration status will remain
`waitingForApproval`.
