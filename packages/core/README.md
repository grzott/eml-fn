# @eml-fn/core

Shared foundation library for the EML (Exp-Minus-Log) function ecosystem. Zero runtime dependencies.

$$\operatorname{eml}(x, y) = e^x - \ln y$$

Paper: [arxiv.org/abs/2603.21852v2](https://arxiv.org/abs/2603.21852v2) by Andrzej Odrzywołek.

## Install

```bash
bun add @eml-fn/core
# or
npm install @eml-fn/core
```

## Quick Start

```typescript
import { eml, evaluate, enumerate, toFormula, constNode, varNode, emlNode } from '@eml-fn/core';

// The fundamental operation
eml(1, 1); // ≈ e (Euler's number)

// Build an EML tree: exp(x) - ln(1) = exp(x)
const tree = emlNode(varNode('x'), constNode(1));
evaluate(tree, { x: 2 }); // ≈ 7.389 (e²)

// Human-readable formula
toFormula(tree); // "exp(x) - ln(1)"

// Enumerate all depth-2 trees with leaves {1, u, v}
for (const t of enumerate(2, ['1', 'u', 'v'])) {
  console.log(toFormula(t));
}
```

## API Reference

### Types

```typescript
import type { EmlTree, EmlConst, EmlVar, EmlNode, SafeOpts, TreeVisitor } from '@eml-fn/core';
```

- **`EmlTree`** — Discriminated union: `EmlConst | EmlVar | EmlNode` (discriminant: `.type`)
- **`EmlConst`** — `{ type: 'const', value: number }` (readonly)
- **`EmlVar`** — `{ type: 'var', name: string }` (readonly)
- **`EmlNode`** — `{ type: 'eml', left: EmlTree, right: EmlTree }` (readonly)
- **`SafeOpts`** — `{ maxExp?: number, minLogArg?: number, onClamp?: 'silent' | 'warn' }`
- **`TreeVisitor<T>`** — `{ const?(node): T, var?(node): T, eml?(node, leftResult, rightResult): T }`

### Constructors

```typescript
import { constNode, varNode, emlNode } from '@eml-fn/core';

constNode(1.0)           // → EmlConst { type: 'const', value: 1 }
varNode('t')             // → EmlVar { type: 'var', name: 't' }
emlNode(left, right)     // → EmlNode { type: 'eml', left, right }
```

### Evaluation

```typescript
import { eml, safeEml, evaluate, safeEvaluate } from '@eml-fn/core';

// Raw EML — follows IEEE 754, returns NaN/Inf naturally
eml(x, y)

// Safe EML — clamped, never returns NaN for finite inputs
safeEml(x, y, opts?)
// Default: maxExp=500, minLogArg=1e-15

// Tree evaluation
evaluate(tree, { t: 0.5, i: 3 })       // throws RangeError on unbound variable
safeEvaluate(tree, vars, opts?)         // clamped version
```

### Enumeration

```typescript
import { enumerate, enumerateByNodeCount, countTrees } from '@eml-fn/core';

// All trees at exact depth, with given leaf types
enumerate(depth, ['1', 'u', 'v'])       // Generator<EmlTree>

// All trees with exactly n eml-nodes
enumerateByNodeCount(n, ['1', 't', 'i'])  // Generator<EmlTree>

// Count without enumerating (Catalan formula)
countTrees(nodes, numLeafTypes)
```

**Scale warning**: Depth 2 with 3 leaves = 81 trees. Depth 3 = ~43M pairs. Use generators + sampling at depth ≥ 3.

### Serialization

```typescript
import { toRPN, fromRPN, toFormula } from '@eml-fn/core';

toRPN(tree)            // → '11E' etc. Tokens: digit=const, 'E'=eml, letter=var
fromRPN('11xE1EE')     // → EmlTree
toFormula(tree)         // → 'exp(x) - ln(exp(1) - ln(y))'
```

RPN round-trips: `fromRPN(toRPN(tree))` deep-equals original tree.

### Analysis

```typescript
import { kComplexity, depth, nodeCount, leafCount, equals, walk } from '@eml-fn/core';

kComplexity(tree)    // Leaf count (always odd, = 2n+1 for n eml-nodes)
depth(tree)          // Max depth (leaf = 0)
nodeCount(tree)      // Count of eml nodes only
leafCount(tree)      // Count of leaf nodes (= nodeCount + 1)
equals(a, b)         // Deep structural equality
walk(tree, visitor)  // Post-order traversal, returns root result
```

### Code Generation

```typescript
import { toGLSL, toHLSL, toTypescript, toPython, toCpp } from '@eml-fn/core';

toGLSL(tree, opts?)       // WebGL2 GLSL with eml() helper + emlPattern()
toHLSL(tree)              // UE5-compatible HLSL
toTypescript(tree)         // Standalone TS function
toPython(tree)             // NumPy-based Python
toCpp(tree)                // C++ with <cmath>
```

**`toGLSL` output** includes float32 safety guards:
- `clamp(x, -20.0, 20.0)` for exp (GPU float32 has tighter limits than CPU float64)
- `log(max(y, 1e-10))` for ln

**Note**: `GlslOpts` and `HlslOpts` are not re-exported from barrel — import from subpath if needed:
```typescript
import type { GlslOpts } from '@eml-fn/core/codegen/glsl';
```

## Test Vectors

| Test | Input | Expected | Tolerance |
|------|-------|----------|-----------|
| Euler constant `11E` | — | e ≈ 2.71828 | < 1e-14 |
| exp(x) `x1E` | x=2 | e² ≈ 7.38906 | < 1e-14 |
| ln(x) `11xE1EE` | x=2 | ln(2) ≈ 0.69315 | < 1e-14 |
| Zero `111E1EE` | — | 0.0 | exact |
| Identity `11x1EE1EE` | x=3.7 | 3.7 | < 1e-13 |
| IEEE: ln(0) = +∞ | eml(1, 0) | +Infinity | exact |
| IEEE: exp(-∞) = 0 | eml(-∞, 1) | 0.0 | exact |
| NaN propagation | eml(NaN, 1) | NaN | exact |

## License

MIT
