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

Commit your work to the current branch. End the commit message with the ticket reference, e.g. `(#12)`, so the commit can be found later with `git log --grep`.
