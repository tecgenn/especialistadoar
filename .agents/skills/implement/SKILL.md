---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use /code-review to review the work.

Then run `/update-project-state` to preserve project memory — it updates project-state.md, marks tickets done, and flags review needs.

Commit your work to the current branch. End the commit message with the ticket reference on its own final line, e.g. `(#02)`, so the commit can be found later with `git log --grep`. Use the ticket's ID exactly as the configured issue tracker numbers it (see `docs/agents/issue-tracker.md`) — for the local markdown tracker that is the zero-padded number in the ticket filename (`01`, `02`, …). The reference appears exactly once, as that final line; do not repeat it in the subject or elsewhere in the message.
