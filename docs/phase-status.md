# Build Phase Status

Last updated: 2026-04-15

## Phase Overview

| Phase | Package | Status | Tests | Notes |
|-------|---------|--------|-------|-------|
| 1 | Monorepo scaffold | ✅ Done | — | Root configs, CI, Changesets |
| 2 | `@eml-fn/core` | ✅ Done | ~65 tests, 6 files | 11 source files, full barrel export |
| 3 | `@eml-fn/pattern-lab` | ⬜ Ready | — | Scaffold only (`export {}` stubs) |
| 4 | `@eml-fn/bullet-choreographer` | ✅ Done | 45 tests, 7 files | Full pipeline + safe eval + playground app |
| 5 | `@eml-fn/wavetable-synth` | ⬜ Ready | — | Scaffold only (`export {}` stubs) |
| 6 | Playground app | 🟡 Partial | — | Bullet choreographer demo done, needs pattern-lab + synth tabs |

## What's Built

### Phase 1 — Scaffold
- Bun workspace (`packages/*`, `apps/*`)
- `tsconfig.base.json` (ES2022, strict, bundler resolution)
- `biome.json` (single quotes, semicolons, 2-space, 100 width)
- `vitest.workspace.ts`
- GitHub Actions CI + release workflows
- Changesets config

### Phase 2 — `@eml-fn/core`
- `types.ts` — `EmlTree` discriminated union (const/var/eml)
- `eml.ts` — Raw + safe EML operations
- `evaluate.ts` — Tree evaluator + safe variant
- `enumerate.ts` — Catalan-based tree generator
- `serialize.ts` — RPN + human-readable formulas
- `analysis.ts` — K-complexity, depth, equality, walk
- `codegen/` — GLSL, HLSL, TypeScript, Python, C++

### Phase 4 — `@eml-fn/bullet-choreographer`
- `types.ts` — PatternPair, TrajectoryData, FilterOpts, SimulateOpts
- `generator.ts` — Full enumeration + sampled generation for depth 3+
- `simulator.ts` — Trajectory sim with safe evaluation (clamped exp/ln)
- `filter.ts` — 6-stage degenerate filter (NaN, static, OOB, identical, boring, saturated)
- `tagger.ts` — Auto-classification (wave, ring, chaos, converge)
- `normalizer.ts` — 4 strategies (adaptive, modular, clamp, sigmoid)
- `renderer.ts` — Canvas 2D trail renderer
- `export/` — TypeScript + JSON export
- `react/` — React integration component

### Playground App (Partial)
- Vite 6 + React 19
- Bullet choreographer pattern explorer
- Depth 1/2/3, leaf type toggles (1, t, i, n, τ)
- Gallery + detail view with normalizer selection
- TypeScript + JSON export with copy-to-clipboard

## Next Steps

1. **Phase 3 — `@eml-fn/pattern-lab`**: WebGL shader art — compile EML trees to GLSL, render 2D patterns, thumbnail grid, GLSL/PNG export
2. **Phase 5 — `@eml-fn/wavetable-synth`**: Audio — waveform generation, FFT, PeriodicWave playback, WAV export
3. **Phase 6 — Playground expansion**: Add pattern-lab and wavetable-synth tabs to the existing playground app

## Verification Commands

```bash
bun install
bun run build          # Build all packages
bun run test           # Run all tests
bun run lint           # Lint check
```
