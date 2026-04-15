# eml-fn — Copilot Workspace Instructions

TypeScript monorepo implementing the **EML (Exp-Minus-Log) function** ecosystem: `eml(x, y) = exp(x) - ln(y)`.

Paper: [arxiv.org/abs/2603.21852v2](https://arxiv.org/abs/2603.21852v2)

## Operator

**Grzegorz Otto** — 8 years professional programming. Core stack: TypeScript, React, Node.js. AI enthusiast, ships end-to-end.

## Monorepo Structure

```
packages/
  core/                  # ✅ Shared types, evaluator, enumerator, 5 code generators
  bullet-choreographer/  # ✅ Bullet/particle trajectory generator
  pattern-lab/           # ⬜ WebGL shader art generator
  wavetable-synth/       # ⬜ Wavetable synthesizer (Web Audio)
apps/
  playground/            # ✅ Vite + React 19 interactive demo
docs/                    # Architecture, EML primer, requirements, phase status
```

## Conventions

- **Runtime**: Bun (package manager, workspace orchestration)
- **Build**: tsup (ESM + CJS dual output, .d.ts generation)
- **Test**: Vitest with `globals: true`
- **Lint**: Biome (single quotes, semicolons, 2-space indent, trailing commas)
- **TypeScript**: Strict mode, `verbatimModuleSyntax`, ES2022 target
- **Import extensions**: Always use `.js` in internal imports (ESM convention)
- **Barrel exports**: Use `export type` for types, group by module. React components at separate `react` entry point.
- **Changesets**: For version management

## Key Commands

```bash
bun run build            # Build all packages
bun run test             # Run all tests
bun run lint             # Lint all code
bun run lint:fix         # Auto-fix lint issues
bun run --filter @eml-fn/<pkg> build   # Build single package
bun run --filter @eml-fn/<pkg> test    # Test single package
```

## Diagrams

- Use **Mermaid** syntax in Markdown files
- Wrap in ` ```mermaid ` code blocks
