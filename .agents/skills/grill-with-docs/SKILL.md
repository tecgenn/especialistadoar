---
name: grill-with-docs
description: A relentless interview to sharpen a plan or design, which also creates docs (ADR's, glossary, and architecture) as we go.
disable-model-invocation: true
---

Run a `/grilling` session, using the `/domain-modeling` skill.

## Architecture doc

When exploring the codebase, if `docs/agents/architecture.md` does not exist, create it with a description of the current system structure — modules, key interfaces, data flow, dependencies, and platforms. If it already exists, rewrite it (not edit in-place) when the session reveals that the structure has changed.
