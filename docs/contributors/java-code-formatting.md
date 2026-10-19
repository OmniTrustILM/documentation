---
sidebar_position: 2
---

# Java code formatting

**Every Java repository on the platform shares one formatting profile, and two build gates fail the build when code drifts from it.**

You do not copy any rules into your repository. They live in the `com.otilm:build-tools` artifact, and you inherit them by inheriting the [`com.otilm:dependencies`](https://github.com/OmniTrustILM/dependencies) parent POM.

## The two gates

Both gates run in the `verify` phase, so a pipeline that runs `mvn verify` or `mvn install` needs no workflow change. A pipeline that stops earlier, at `package` or `test`, never reaches them and needs a step of its own:

```bash
mvn spotless:check checkstyle:check
```

The same command is the quick local check. It runs both gates without the test suite that `mvn verify` brings along.

| Gate           | What it checks                                                                                   | How to fix a failure                                                       |
|----------------|--------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------|
| **Spotless**   | The whole canonical style: indentation, line wrapping, import order                              | `mvn spotless:apply` fixes every violation                                 |
| **Checkstyle** | Four import and brace rules: `AvoidStarImport`, `NeedBraces`, `UnusedImports`, `RedundantImport` | Run `mvn spotless:apply` first, then fix the rest by hand or with your IDE |

The split matters when a build goes red. **A Spotless failure is always mechanical.** Run one command and it is gone.

**A Checkstyle failure is mostly yours to fix.** `mvn spotless:apply` removes unused imports, so run it first. Spotless has no type information, though, so it cannot expand a wildcard import into single-type imports, and it will not add braces to a one-line `if`. You fix those yourself.

:::tip[The one command to remember]
`mvn spotless:apply`
:::

## The pre-commit hook

A `pre-commit` hook formats your staged Java files before each commit, so most violations never reach a build at all.

**You do not install it.** It ships inside the same `build-tools` artifact, and your first Maven build after cloning writes it into your repository's hooks directory.

Two consequences are worth knowing before your first build:

- **The install replaces any existing `pre-commit` hook, on every build, without asking.** The content is identical each time, so this is invisible unless you keep a hook of your own. If you do, build with `-P -install-git-hooks` so yours survives.
- Hooks are never committed, so this only ever affects your own machine.

Linked worktrees are handled. The build mirrors the hook into the shared hooks directory that Git actually runs hooks from, because a hook installed into the per-worktree directory would sit there unused.

## Adopting the gates in a repository

:::warning[Do the reformat first and the version bump last]
If you commit the parent bump first, the gates go live before the code is formatted.
Every build between that commit and the reformat then fails, CI included.
:::

1. Copy `.editorconfig` and `.gitattributes` from the [`dependencies`](https://github.com/OmniTrustILM/dependencies) repository. Do this before you open the project.
2. Bump the parent version locally. Do not commit it yet.
3. Run `mvn spotless:apply`.
4. Run `mvn spotless:check checkstyle:check` and fix what Checkstyle reports by hand. Wildcard imports are the common one.
5. Commit the reformat as a single mechanical commit. Change nothing else in it — leave the two files from step 1 and the parent bump uncommitted for now.
6. Create a `.git-blame-ignore-revs` file at the repository root containing that commit's full SHA, and commit it.
7. Commit `.editorconfig` and `.gitattributes`.
8. Commit the parent bump. This is what turns the gates on, so it goes last.
9. Merge the pull request with a merge commit, not a squash. A squash replaces the reformat commit with a new one, so the SHA in `.git-blame-ignore-revs` never reaches the main branch.

:::danger[Step 1 has to come first, or step 4 will fight you]
IntelliJ collapses imports into a wildcard at 5 classes or 3 static members by default — exactly what `AvoidStarImport` rejects. `.editorconfig` raises both thresholds to 999.

Without it in place, expanding the imports Checkstyle reports re-collapses them in whatever other files your IDE touches in the same pass. The violation count moves sideways instead of down, `git status` shows nothing unusual, and the reformat commit has to be redone.

If the project is already open, **reload it** — a newly added `.editorconfig` is not picked up automatically.
:::

Step 6 is what keeps `git blame` useful. A one-shot reformat touches nearly every line of every file, and without that file it becomes the last author of all of them. GitHub applies `.git-blame-ignore-revs` automatically in its blame view, and the parent POM wires your local `git blame` to use it too.

List each commit by its full 40-character SHA, one per line. Git rejects an abbreviated one, and because every developer's build points `git blame` at this file, a single short SHA breaks `git blame` for everyone in the repository:

```text
# Apply Spotless formatting and Checkstyle fixes
4e8d54ee5957bff5f66dba7b51cfa5091aa3f026
```

When a later parent version changes the formatting profile, reformat again in a commit of its own and append its SHA to the same file.

Keeping the reformat commit free of anything else is what lets it be skipped wholesale — that is why the config files are copied first but committed after it.

Step 1 cannot be done for you. Your IDE and your checkout only honor files that exist in your own repository, so the parent POM has no way to deliver them.

## Keeping your IDE in step

`.editorconfig` mirrors the shared formatter profile. Every major IDE reads its whitespace settings, but the Java formatting rules are IntelliJ keys. In IntelliJ, your editor comes close enough that Spotless usually has nothing left to correct.

One known gap: long annotation member arrays. The shared profile chops them one element per line, and no IntelliJ setting reproduces that. IntelliJ *preserves* the chopped shape once Spotless has applied it, but it will not *produce* it on freshly typed code — so expect `mvn spotless:apply` to rewrite long annotation arrays you have just written. The same applies to annotation arguments that overflow the margin.

It also does one thing Spotless cannot: it stops your IDE from *undoing* the import cleanup. IntelliJ collapses imports into a wildcard at 5 classes or 3 static members by default, and `AvoidStarImport` rejects exactly that. `.editorconfig` raises both thresholds to 999, so the two stop disagreeing.

`.gitattributes` pins line endings to LF. This matters most on Windows, where a checkout that converts them will fail the format check on files you never touched.

## Windows: refresh your worktree once

**If you already had the repository checked out on Windows with CRLF line endings, your first build after the gates land will fail.** That is the usual state of a Windows checkout, because Git for Windows installs with `core.autocrlf=true`. It fails on files the reformat never touched, which is confusing enough to be worth explaining.

Git rewrites a file during checkout only when the commit changed that file. The reformat commit changes most of your Java files, so those come back with LF. The rest keep the CRLF endings they have had since you first cloned. `.gitattributes` cannot reach back and fix them.

Spotless reads the bytes on disk, sees CRLF, and fails.

:::warning[`git status` will tell you nothing is wrong]
Git normalises CRLF as it reads, so it reports a clean tree. You get a failing build with no visible cause. Nothing is wrong with your changes.

To see it, ask Git what is actually on disk:

```bash
git ls-files --eol -- "*.java"
```

An `i/lf` index entry against a `w/crlf` worktree entry is the mismatch `git status` hides.
:::

Any one of these fixes it. Pick by how much local state you want to keep.

| What you do | What it fixes | What it costs |
|---|---|---|
| Delete the folder and clone again | Every file in the worktree | You lose uncommitted work, stashes and local branches |
| `git rm --cached -r .` then `git reset --hard` | Every file in the worktree | **Discards uncommitted changes.** Commit or stash first |
| `mvn spotless:apply` | Java sources only | Other text files stay on CRLF |

The middle one is the usual choice. You run it once per worktree and never again.

A fresh clone is unaffected, and so is CI on ephemeral runners — both check out with LF from the start. A **persistent or self-hosted Windows runner** is a long-lived worktree like yours, so it needs the same one-time refresh.

## When you need to opt out

| Situation                              | Escape hatch             |
|----------------------------------------|--------------------------|
| One build, formatting is not the point | `-Dspotless.skip=true`   |
| One build, lint is not the point       | `-Dcheckstyle.skip=true` |
| You want to keep your own hook         | `-P -install-git-hooks`  |
| One commit, the hook is in the way     | `git commit --no-verify` |

**None of these change your pipeline.** The gates in CI remain authoritative, so anything you skip locally is caught before merge.
