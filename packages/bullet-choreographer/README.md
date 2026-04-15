# @eml-fn/bullet-choreographer

Bullet and particle trajectory generator powered by the EML function. Pairs of EML trees define x(t,i) and y(t,i) positions — generating thousands of unique, mathematically defined movement patterns from a single operator.

## Install

```bash
bun add @eml-fn/bullet-choreographer
# or
npm install @eml-fn/bullet-choreographer
```

Requires `@eml-fn/core` (installed automatically as dependency).

## Quick Start

```typescript
import {
  generatePairsSampled,
  filterDegenerate,
  simulate,
  autoTag,
  exportTypescript,
  exportJSON,
} from '@eml-fn/bullet-choreographer';

// Generate pattern pairs at depth 2 with leaf types {1, t, i, n}
const pairs = generatePairsSampled(2, ['1', 't', 'i', 'n'], 5000);

// Filter out degenerate patterns (NaN, static, boring, etc.)
const survivors = filterDegenerate(pairs);
// Typical survival rate: 5-20% — these are the interesting ones

// Simulate a pattern: 50 bullets, 200 time steps
const trajectory = simulate(survivors[0], 50, 200, 0.016);

// Auto-tag by trajectory shape
const tagged = autoTag(survivors[0], trajectory);
console.log(tagged.tags); // ['wave', 'converge']

// Export as TypeScript function
const code = exportTypescript(survivors[0]);
// → function bulletPos(t: number, i: number, n: number): [number, number] { ... }

// Export as JSON (serializable, round-trippable)
const json = exportJSON(survivors[0]);
```

## Pipeline Overview

```
generatePairs/generatePairsSampled
  → filterDegenerate (6-stage quality gate)
    → autoTag (classify trajectory shape)
      → normalize (fit to display bounds)
        → render / export
```

## API Reference

### Generation

```typescript
import { generatePairs, generatePairsSampled } from '@eml-fn/bullet-choreographer';

// Full enumeration (depth 1-2 only — depth 3 = millions of pairs)
const allPairs = generatePairs(depth, leafTypes);

// Sampled generation (safe for any depth)
const sampled = generatePairsSampled(depth, leafTypes, maxPairs);
// Falls back to full enum when total ≤ maxPairs
```

**Leaf types**: `'1'` (constant), `'t'` (time), `'i'` (bullet index), `'n'` (bullet count), `'tau'` (2π ≈ 6.28)

### Simulation

```typescript
import { simulate } from '@eml-fn/bullet-choreographer';

const trajectory = simulate(pair, bulletCount, timeSteps, dt, opts?);
// Returns TrajectoryData with Float32Array positions
// Index: data[(step * bulletCount + bulletIdx) * 2 + 0] = x, + 1 = y
```

**Safe mode** (default): Uses `safeEvaluate` with exp clamped to ±10. Bullets survive nested exp — `exp(exp(exp(x)))` saturates at ~22,026 instead of Infinity.

**Variables bound during simulation**:
- `t` — time (starts at 0, increments by dt each step)
- `i` — raw integer bullet index (0 to bulletCount-1)
- `n` — total bullet count
- `tau` — 2π ≈ 6.283

### Filtering

```typescript
import { filterDegenerate } from '@eml-fn/bullet-choreographer';
import type { FilterOpts } from '@eml-fn/bullet-choreographer';

const survivors = filterDegenerate(pairs, opts?);
```

**6-stage filter pipeline** (in order):

1. **NaN/Inf check** — any bullet has NaN at t=0 → reject
2. **Static check** — all bullets at same position (variance < 1e-6) → reject
3. **OOB check** — all bullets exit ±1000 within first 5 steps → reject
4. **Identical check** — all trajectories pairwise distance < 1e-4 → reject
5. **Boring check** — total position variance < 1.0 → reject
6. **Saturated check** — >60% of positions hit clamp ceiling → reject

Expected rejection rate: 80-95% at depth 2. The 5-20% survivors are the interesting patterns.

All thresholds are configurable via `FilterOpts`.

### Auto-Tagging

```typescript
import { autoTag } from '@eml-fn/bullet-choreographer';

const pair = autoTag(pair, trajectoryData);
console.log(pair.tags); // ['wave', 'ring', 'converge']
```

**Tag types**: `spiral`, `fan`, `wave`, `ring`, `chaos`, `converge`, `diverge`

A pattern can have multiple tags. Every accepted pattern gets at least one tag.

### Normalization

```typescript
import { normalizers, normalizeAdaptive } from '@eml-fn/bullet-choreographer';
```

| Strategy | Description |
|----------|------------|
| `clamp` | `clamp(x, -bounds, bounds)` — preserves shape |
| `modular` | `((x % size) + size) % size` — toroidal wrapping |
| `sigmoid` | `size * tanh(x / scale)` — infinite → finite |
| `adaptive` | Per-pattern per-axis min/max rescale — best visual diversity |

### Rendering

```typescript
import { simulateToCanvas } from '@eml-fn/bullet-choreographer';

simulateToCanvas(pair, canvas, opts?);
// Renders bullet trails directly to a Canvas 2D context
```

### Export

```typescript
import { exportTypescript, exportJSON, importJSON } from '@eml-fn/bullet-choreographer';

// TypeScript: copy-pasteable function
const code = exportTypescript(pair);
// → function bulletPos(t: number, i: number, n: number): [number, number] { ... }

// JSON: serializable pattern definition (uses RPN)
const json = exportJSON(pair);       // → { xRPN: "tiE", yRPN: "1iE", tags: [...] }
const restored = importJSON(json);   // → PatternPair (round-trips)
```

### Types

```typescript
import type {
  PatternPair,       // { xTree, yTree, tags?, meta? }
  TrajectoryData,    // { positions: Float32Array, bulletCount, timeSteps, dt, alive }
  FilterOpts,        // All filter thresholds (configurable)
  SimulateOpts,      // { safe?: boolean, maxExp?: number }
  TagName,           // 'spiral' | 'fan' | 'wave' | 'ring' | 'chaos' | 'converge' | 'diverge'
  NormalizerType,    // 'clamp' | 'modular' | 'sigmoid' | 'adaptive'
  RenderOpts,        // Canvas rendering options
  PatternJSON,       // Serializable JSON format
} from '@eml-fn/bullet-choreographer';
```

## Performance

- `simulate(50 bullets, 200 steps)`: <5ms per pattern
- `filterDegenerate(100 patterns)`: <1s total
- `generatePairsSampled` at depth 2: <50ms for full enumeration

## License

MIT
