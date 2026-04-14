# eml-fn

TypeScript libraries for the **EML (Exp-Minus-Log) function**: `eml(x, y) = exp(x) - ln(y)`.

Based on [arXiv 2603.21852v2](https://arxiv.org/abs/2603.21852v2) by Andrzej Odrzywołek.

## Packages

| Package                                                           | Description                                                     |
| ----------------------------------------------------------------- | --------------------------------------------------------------- |
| [`@eml-fn/core`](./packages/core)                                 | Tree data structures, evaluator, enumerator, code generators    |
| [`@eml-fn/pattern-lab`](./packages/pattern-lab)                   | WebGL shader art generator — enumerate & render 2D EML patterns |
| [`@eml-fn/bullet-choreographer`](./packages/bullet-choreographer) | Bullet/particle trajectory generator for game dev               |
| [`@eml-fn/wavetable-synth`](./packages/wavetable-synth)           | Wavetable synthesizer — EML waveforms via Web Audio API         |

## Quick Start

```bash
bun add @eml-fn/core
```

```typescript
import { eml, enumerate, toGLSL } from "@eml-fn/core";

// The fundamental operation
eml(1, 1); // ≈ e (Euler's number)

// Enumerate all depth-2 patterns
for (const tree of enumerate(2, ["1", "u", "v"])) {
  console.log(toGLSL(tree));
}
```

## Development

```bash
bun install
bun run build
bun run test
```

## License

MIT
