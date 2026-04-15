---
description: "Verify or repair the eml-fn monorepo — check builds, tests, lint, and consistency"
agent: "eml-builder"
argument-hint: "'verify' (check all passes), 'fix <issue>' (repair specific problem)"
tools: [execute, read, edit, search, todo]
---

Run verification checks on the eml-fn monorepo. Use for health checks, repair, or post-implementation validation.

## Quick Verification

```bash
cd C:\_PROG\eml-fn
bun install
bun run build
bun run test
bun run lint
```

**Expected**: All commands exit 0.

## Package Status

| Package | Expected Tests |
|---------|---------------|
| `@eml-fn/core` | ~65 tests (6 files) |
| `@eml-fn/bullet-choreographer` | ~45 tests |
| `@eml-fn/pattern-lab` | Depends on impl status |
| `@eml-fn/wavetable-synth` | Depends on impl status |

## References

- [Architecture](../../docs/architecture.md)
- [Requirements](../../docs/requirements.md)
- [Phase Status](../../docs/phase-status.md)
