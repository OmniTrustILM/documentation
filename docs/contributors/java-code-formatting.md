---
sidebar_position: 2.5
---

# Java code formatting

**Java repositories that inherit the platform's parent POM share one formatting profile, and two build gates fail the build when code drifts from it.**

The parent POM is [`com.otilm:dependencies`](https://github.com/OmniTrustILM/dependencies), and the rules ship in its `com.otilm:build-tools` artifact, so you copy none of them into your repository.

## The two gates

Both gates run in the `verify` phase, so `mvn verify` and `mvn install` run them.

| Gate           | What it checks                                                                              | How to fix a failure                                                       |
|----------------|---------------------------------------------------------------------------------------------|----------------------------------------------------------------------------|
| **Spotless**   | The whole canonical style: indentation, line wrapping, import order                         | `mvn spotless:apply` fixes every violation                                 |
| **Checkstyle** | Import and brace rules: `AvoidStarImport`, `NeedBraces`, `UnusedImports`, `RedundantImport` | Run `mvn spotless:apply` first, then fix the rest by hand or with your IDE |

`mvn spotless:apply` also removes unused imports. It cannot replace a wildcard import with single-type imports or add missing braces, so you fix those yourself.

To run only the gates, without the test suite:

```bash
mvn spotless:check checkstyle:check
```

A CI pipeline that stops before `verify`, at `package` or `test`, never reaches the gates and needs this command as a step of its own.

## The pre-commit hook

A `pre-commit` hook formats your staged Java files and re-stages them, so most violations never reach a build. A file that also has unstaged changes is committed unformatted, with a warning, because re-staging it would sweep those changes into the commit. Stage such a file completely, or run `mvn spotless:apply` yourself before you push.

You do not install the hook. It ships in `build-tools`, and your first Maven build after cloning writes it into the repository's hooks directory, linked worktrees included.

**Every build replaces an existing `pre-commit` hook, without asking.** If you set `core.hooksPath`, the build writes the hook to that directory as well; with a global `core.hooksPath`, that replaces the `pre-commit` hook every repository on your machine runs. To keep a hook of your own, add `-P -install-git-hooks` to every build.

## Keeping your IDE in step

`.editorconfig` in the repository root mirrors the formatter profile. Any editor with EditorConfig support applies its whitespace and line-ending settings. The Java formatting rules are IntelliJ (`ij_*`) properties, and with them IntelliJ formats closely enough that Spotless usually has nothing left to correct. In nested constructs (annotation arrays, lambdas, deeply nested call arguments and record headers) IntelliJ and Spotless still wrap differently, so expect `mvn spotless:apply` or the hook to rewrap some of what you type there.

`.editorconfig` also stops IntelliJ from undoing the import cleanup. By default IntelliJ collapses imports into a wildcard at 5 classes or 3 static members, which `AvoidStarImport` rejects; `.editorconfig` raises both thresholds to 999.

`.gitattributes` makes Git check out Java and other text files with LF line endings on every platform, which is what the format check expects.

## Adopting the gates in a repository

A repository adopts the gates once, by bumping to a parent version that carries them. The bump is what turns the gates on, so it is committed last, after the code is formatted:

1. Copy [`.editorconfig`](https://github.com/OmniTrustILM/dependencies/blob/main/.editorconfig) and [`.gitattributes`](https://github.com/OmniTrustILM/dependencies/blob/main/.gitattributes), which are not inherited, from the `dependencies` repository into the repository root. If the project is open in your IDE, reload it.
2. Bump the parent version locally, without committing it.
3. Run `mvn spotless:apply`, then `mvn spotless:check checkstyle:check`, and fix what Checkstyle reports. Wildcard imports are the common one.
4. Commit the reformat on its own, with nothing else in the commit.
5. Create `.git-blame-ignore-revs` in the repository root with the full SHA of the reformat commit, and commit it.
6. Commit `.editorconfig` and `.gitattributes`, then the parent bump.
7. Merge the pull request with a merge commit. A squash or rebase merge rewrites the reformat commit, so the SHA you listed never reaches the target branch.

`.git-blame-ignore-revs` keeps `git blame` pointing at the real authors rather than at the reformat, which touches nearly every line. GitHub's blame view reads it, and the build configures every contributor's local `git blame` to read it too. List each commit by its full SHA, one per line: Git rejects an abbreviated SHA, and a single short one breaks `git blame` for everyone in the repository.

```text
# Apply Spotless formatting and Checkstyle fixes
4e8d54ee5957bff5f66dba7b51cfa5091aa3f026
```

When a later parent version changes the formatting profile, reformat in a commit of its own, append its SHA to the same file, and merge it the same way.

## Windows: refreshing an older checkout

On a Windows checkout made before the repository adopted `.gitattributes`, typically with `core.autocrlf=true`, the first build after the gates arrive can fail on files you never touched, while `git status` reports a clean tree. Git rewrites only the files a commit changes, so the files the reformat left alone keep their CRLF line endings, and Spotless rejects them.

`git ls-files --eol -- "*.java"` shows the mismatch: an `i/lf` index entry next to a `w/crlf` worktree entry. Refresh the worktree once: commit or stash your changes first, because `git reset --hard` discards them, then run:

```bash
git rm --cached -r .
git reset --hard
```

A fresh clone does not have the problem.

## When you need to opt out

| Situation                                | Escape hatch             |
|------------------------------------------|--------------------------|
| One build, formatting is not the point   | `-Dspotless.skip=true`   |
| One build, lint is not the point         | `-Dcheckstyle.skip=true` |
| You keep a `pre-commit` hook of your own | `-P -install-git-hooks`  |
| One commit, the hook is in the way       | `git commit --no-verify` |

None of these change CI. As long as the repository's CI runs the gates (see [The two gates](#the-two-gates)), anything you skip locally is still caught there before merge.
