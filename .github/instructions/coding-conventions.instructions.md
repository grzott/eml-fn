---
description: "Coding conventions for eml-fn packages. Applied when editing source files under packages/."
applyTo: "packages/**"
---

# Package Coding Conventions

## TypeScript

- **Strict mode**: All packages extend `tsconfig.base.json` (ES2022, strict, verbatimModuleSyntax)
- **Import extensions**: Always `.js` in internal imports (ESM convention)
- **Type exports**: Use `export type` for type-only exports (enforced by `verbatimModuleSyntax`)
- **Readonly**: All `EmlTree` node properties are `readonly`

## Code Style (Biome)

- Single quotes, semicolons always, trailing commas
- 2-space indent, 100 char line width
- No unused imports, no `any` without justification

## File Organization

- Types in `types.ts`, one per module
- Pure functions preferred — no classes unless state is needed
- Barrel export in `index.ts`: types first, functions grouped by module
- React components at `src/react/` with separate tsup entry point

## Numerical Safety

- Always clamp exp inputs (`maxExp: 500` for CPU float64, `20.0` for GPU float32)
- Always guard log: `log(max(y, minLogArg))` where `minLogArg >= 1e-15`
- Check for NaN/Infinity at system boundaries
- Never divide without checking for zero

## Performance

- Use `Float32Array` / `Float64Array` for bulk numerical data
- Use generators for large enumerations (depth ≥ 3 produces millions)
- WebGL: single shared context + FBO for batch rendering, chunk with rAF
