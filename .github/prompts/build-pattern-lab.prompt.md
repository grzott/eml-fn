---
description: "Build @eml-fn/pattern-lab — EML shader art generator with WebGL renderer, thumbnail grid, and exports"
agent: "eml-builder"
argument-hint: "Optional: 'P0 only', 'P0 + P1', or 'full' (default: P0)"
tools: [execute, read, edit, search, todo]
---

Build `@eml-fn/pattern-lab` in the existing eml-fn monorepo. Read the plan and requirements first, then implement.

## Prerequisites

- Phase 1 (scaffold) and Phase 2 (`@eml-fn/core`) must be complete
- Verify: `bun run --filter @eml-fn/core test` passes before starting

## References (read BEFORE coding)

1. [Architecture](../../docs/architecture.md) — monorepo structure, key decisions
2. [Requirements — pattern-lab section](../../docs/requirements.md) — P0/P1/P2 requirements, hazards, file structure

## File Structure

```
packages/pattern-lab/src/
├── types.ts              # (P0) NormalizerStrategy, InputMapping, RenderOpts, etc.
├── shader-compiler.ts    # (P0) compileToShader(tree, mapping?) → complete GLSL source
├── renderer.ts           # (P0) renderToCanvas(shader, canvas, opts?)
├── thumbnail-grid.ts     # (P0) renderThumbnails(trees, container, opts?) — single WebGL ctx + FBO
├── normalizers.ts        # (P0) sigmoid, tanh, modular (fract), adaptive strategies
├── color-ramps.ts        # (P0) grayscale, viridis, magma, plasma, turbo, custom
├── export/
│   ├── glsl-export.ts    # (P0) Copy-pasteable GLSL + Shadertoy mainImage wrapper
│   ├── png-export.ts     # (P0) Canvas → Blob → download (256–4096 resolution)
│   └── ue5-export.ts     # (P1) HLSL Custom Expression string — skip for P0-only
├── react/                # (P1) Optional sub-export — skip for P0-only
│   ├── PatternGrid.tsx
│   ├── PatternViewer.tsx
│   └── PatternEditor.tsx
└── index.ts              # (P0) Barrel export (no React in main entrypoint)
```

> **Note**: `src/export/` directory doesn't exist in scaffold — create it.

## Key Implementation Notes

### Types (P0)

```typescript
export type NormalizerStrategy = 'sigmoid' | 'tanh' | 'modular' | 'adaptive';
export type ColorRampName = 'grayscale' | 'viridis' | 'magma' | 'plasma' | 'turbo';

export interface InputMapping {
  varMap?: Record<string, string>;
  uvRange?: [number, number];
}

export interface ShaderOpts {
  normalizer?: NormalizerStrategy;
  colorRamp?: ColorRampName;
  inputMapping?: InputMapping;
}

export interface RenderOpts {
  width?: number;   // default 256
  height?: number;  // default 256
}

export interface ThumbnailGridOpts extends RenderOpts {
  chunkSize?: number;   // patterns per rAF frame, default 16
  errorColor?: [number, number, number]; // RGB 0-1 for NaN/Inf pixels, default [0,0,0]
}
```

### GLSL Generation (P0, critical)

**IMPORTANT**: `shader-compiler.ts` does NOT duplicate `@eml-fn/core`'s `toGLSL()`. It **wraps** it:

1. Call `toGLSL(tree, { varMap })` from core → returns `eml()` helper + `emlPattern(vec2 uv)` function body
2. Wrap in a complete WebGL2 fragment shader template with normalizer and color ramp injected

The core's `toGLSL()` already includes float32-safe clamps:
- **Clamp at 20.0** (NOT 88.0) — nested EML on GPU float32 overflows
- `log(max(y, 1e-10))` — guards against log(0) and log(negative)

### Thumbnail Grid (P0, tricky)

- Single shared WebGL context + FBO rendering → `readPixels` → `ImageData` → `<img>` DataURLs
- Avoids browser's 8-16 WebGL context limit
- Chunk rendering: 16 patterns per `requestAnimationFrame` to avoid main thread freeze
- Must handle 81 patterns (depth 2) without frame drops

### Normalizers (P0)

GLSL functions mapping raw EML output to `[0, 1]`:
- `sigmoid`: `1.0 / (1.0 + exp(-x * 0.1))`
- `tanh`: `(tanh(x) + 1.0) / 2.0`
- `modular`: `fract(x)`
- `adaptive`: CPU estimate min/max at 16×16 grid, bake constants into shader

### Color Ramps (P0)

Hardcoded `vec3` arrays in GLSL (no texture binding). 16 color stops, linearly interpolated. 5 built-in ramps: grayscale, viridis, magma, plasma, turbo.

### Barrel Export (`index.ts`)

```typescript
export type { NormalizerStrategy, ColorRampName, InputMapping, ShaderOpts, RenderOpts, ThumbnailGridOpts } from './types.js';
export { compileToShader } from './shader-compiler.js';
export { renderToCanvas } from './renderer.js';
export { renderThumbnails } from './thumbnail-grid.js';
export { normalizers, type Normalizer } from './normalizers.js';
export { colorRamps, getColorRampGLSL } from './color-ramps.js';
export { exportGLSL, exportShadertoy } from './export/glsl-export.js';
export { exportPNG } from './export/png-export.js';
```

## Test Strategy

Browser APIs (WebGL, Canvas2D): test pure logic only. Mark renderer/thumbnail tests as `test.skip` with `// TODO: Playwright E2E`.

## Verification

```bash
bun run --filter @eml-fn/pattern-lab build
bun run --filter @eml-fn/pattern-lab test
bun run --filter @eml-fn/pattern-lab lint
```
