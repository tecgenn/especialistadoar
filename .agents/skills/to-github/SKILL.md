---
name: to-github
description: Migrate local-tracker tickets into real GitHub issues, preserving blocking edges as native dependencies, then repoint the repo's tracker to GitHub.
argument-hint: "a feature-slug, a ticket range/list (e.g. 09-13), or 'all' — depends on how this repo's tracker organizes tickets. Omit to migrate only what's still pending."
disable-model-invocation: true
---

# To GitHub

Move tickets off a **local-markdown** tracker onto GitHub Issues, wiring up each ticket's blocking edges as GitHub's **native issue dependencies** rather than prose. This is a **one-way door**: after it runs, the repo's tracker is GitHub from here on, not just for the tickets migrated today.

The issue tracker should currently be local markdown — run `/setup-matt-pocock-skills` first if this repo has never been configured.

## Process

### 1. Learn the source convention and scope

Read `docs/agents/issue-tracker.md` — don't assume a fixed layout. Some repos group tickets per feature (`.scratch/<feature-slug>/issues/`); others keep one flat list (e.g. `tickets/`). This doc says which, and the exact per-ticket file shape — heading style, how "Blocked by" is written, whether titles live in the file or only in the filename.

Resolve the argument against what you found:

- **Per-feature layout** → the argument is the feature-slug; the candidates are every file under that feature's issues folder.
- **Flat layout** → the argument selects tickets: a list/range (`09-13`), the word `all`, or nothing — which defaults to tickets **not yet complete**. If the repo has a `docs/agents/project-state.md` with a Frontier/Completed split, use it to tell them apart; otherwise treat a ticket as complete when every acceptance criterion is checked `[x]`.

Check for an existing import manifest (`GITHUB-IMPORT.md`, co-located with the tickets — see step 5) and drop any candidate already listed there, so re-running only picks up what's new.

For each remaining candidate, read the file and extract the body, the **Blocked by** list, and a title. Prefer the name recorded against that ticket's number in `docs/agents/project-state.md` if one exists; otherwise derive a title from the filename.

Verify `gh auth status` succeeds and the repo has a GitHub remote. If either fails, stop and tell the user what to fix.

Present the final candidate list — number, title, blockers, and whether it will be created open or closed — and confirm with the user before creating anything real.

**Done when:** every candidate ticket is accounted for in the list, and the user has confirmed.

### 2. Repoint the tracker

Run `/setup-matt-pocock-skills`, choosing **GitHub** as the issue tracker. It's the single source of truth for tracker conventions — don't duplicate its logic here, just invoke it.

**Done when:** `docs/agents/issue-tracker.md` describes GitHub conventions.

### 3. Publish the issues

GitHub is now the configured tracker, so follow `docs/agents/issue-tracker.md`'s conventions for "publish to the issue tracker" — one issue per ticket, in blockers-first order.

Reshape each body into:

<issue-body-template>

## What to build

[unchanged]

## Acceptance criteria

[unchanged — leave existing `[x]` checkmarks as-is, they're accurate history]

</issue-body-template>

Drop the **Blocked by** section from the body — a native dependency (step 4) replaces it. Apply the `ready-for-agent` label. If every acceptance criterion was already checked, close the issue right after creating it (`gh issue close <n> --comment "Migrated already-complete ticket, kept for history."`) — everything else stays open.

As each issue is created, record its issue number **and database id** against the ticket's original local number — the dependency API in step 4 keys on the database id, not the issue number (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`).

**Done when:** every candidate ticket has a corresponding GitHub issue number and database id recorded, with the right open/closed state.

### 4. Wire the blocking edges

For every ticket that had a **Blocked by** list, add a native dependency for each blocker — the same mechanism `docs/agents/issue-tracker.md` documents under "Wayfinding operations → Blocking" (`gh api` against the `dependencies/blocked_by` endpoint, keyed by the blocker's database id). This applies even when the blocker itself was migrated closed — a closed blocker still satisfies the dependency.

If a blocker wasn't part of this run — migrated in an earlier pass, or not migrated at all yet — look it up in the existing `GITHUB-IMPORT.md` manifest for its issue number. If it isn't there either, skip that edge and flag it to the user instead of guessing.

**Done when:** for every migrated ticket with blockers, `gh api repos/<owner>/<repo>/issues/<n> --jq .issue_dependencies_summary.blocked_by` matches the count of *open* blockers in the original list.

### 5. Record the manifest

Append to (or create) the manifest next to the tickets — `tickets/GITHUB-IMPORT.md` for a flat layout, `.scratch/<feature-slug>/GITHUB-IMPORT.md` for a per-feature one:

<import-manifest-template>

# GitHub import log

| Local ticket | GitHub issue | Migrated |
|---|---|---|
| 09-export-delete | #41 | <date> |

</import-manifest-template>

Append new rows rather than overwriting — this file is the record re-runs check against in step 1.

**Done when:** every ticket migrated in this run has a row, and re-running this skill with the same scope would find nothing left to do.

### 6. Report

Show the user the new manifest rows and a link to the issue list.
