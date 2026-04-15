---
description: "Review code quality, patterns, and consistency across the eml-fn monorepo"
agent: "eml-builder"
argument-hint: "'<package-name>' to review a specific package, or 'all' for full review"
tools: [read, search, todo]
---

Review the specified package(s) for code quality, consistency with established patterns, and correctness.

## Review Checklist

1. **Types**: All public types use `export type`, readonly properties where appropriate
2. **Imports**: `.js` extensions on all internal imports, `import type` for type-only
3. **Barrel export**: Main `index.ts` exports grouped by module, React at separate entry
4. **Code style**: Biome-compliant (single quotes, semicolons, trailing commas, 2-space indent)
5. **Tests**: Every public function has at least one test, edge cases covered (NaN, Infinity, empty)
6. **Performance**: Operations within budget (see [requirements.md](../../docs/requirements.md))
7. **Numerical safety**: exp clamped, log guarded, NaN handled, no division by zero
8. **Consistency**: Patterns match core package conventions

## References

- [Architecture](../../docs/architecture.md) — established patterns
- [Requirements](../../docs/requirements.md) — per-package specs
