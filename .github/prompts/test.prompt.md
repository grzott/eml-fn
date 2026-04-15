---
description: "Run tests for a specific package or the entire monorepo and analyze failures"
agent: "eml-builder"
argument-hint: "'all', '@eml-fn/core', '@eml-fn/bullet-choreographer', '@eml-fn/pattern-lab', '@eml-fn/wavetable-synth'"
tools: [execute, read, search, todo]
---

Run tests and analyze results. Fix failures if the cause is clear.

## Commands

```bash
# All packages
bun run test

# Single package
bun run --filter @eml-fn/core test
bun run --filter @eml-fn/bullet-choreographer test
bun run --filter @eml-fn/pattern-lab test
bun run --filter @eml-fn/wavetable-synth test

# With coverage
bun run --filter @eml-fn/<pkg> test -- --coverage
```

## On Failure

1. Read the failing test file
2. Read the source file being tested
3. Determine if it's a test bug or implementation bug
4. Fix and re-run
