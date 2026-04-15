---
description: "Build @eml-fn/wavetable-synth — waveform generator, Web Audio playback, PeriodicWave, and WAV export"
agent: "eml-builder"
argument-hint: "Optional: 'P0 only', 'P0 + P1', or 'full' (default: P0)"
tools: [execute, read, edit, search, todo]
---

Build `@eml-fn/wavetable-synth` in the existing eml-fn monorepo. Read the plan and requirements first, then implement.

## Prerequisites

- Phase 1 (scaffold) and Phase 2 (`@eml-fn/core`) must be complete
- Verify: `bun run --filter @eml-fn/core test` passes before starting

## References (read BEFORE coding)

1. [Architecture](../../docs/architecture.md) — monorepo structure, key decisions
2. [Requirements — wavetable-synth section](../../docs/requirements.md) — P0/P1/P2 requirements, hazards, WAV spec, file structure

## File Structure

```
packages/wavetable-synth/src/
├── types.ts          # (P0) Waveform, WavetableFrame, PlaybackOpts, WavExportOpts
├── generator.ts      # (P0) generateWaveform(tree, cycleLength?), batchGenerate(trees)
├── normalize.ts      # (P0) dcRemove(), peakNormalize(), isSilent()
├── fft.ts            # (P0) radix-2 Cooley-Tukey FFT — ~50-80 lines, no external deps
├── playback.ts       # (P0) createOscillator(ctx, waveform, freq), createPeriodicWave(ctx, waveform)
├── analysis.ts       # (P0) spectralFlatness(), crestFactor()
├── export/
│   └── wav-export.ts # (P0) 16-bit PCM WAV at 44100 Hz, valid RIFF header
├── react/            # (P1) Optional sub-export
└── index.ts          # (P0) Barrel export
```

## Key Implementation Notes

### Waveform Generation (P0)

- Default: **2048 samples** over `[0, 2π]`
- Variable binding: `{ t: samplePhase }` where `samplePhase = i * 2π / cycleLength`
- NaN/Infinity values → replace with 0.0
- Output MUST be DC-removed and peak-normalized

### PeriodicWave Pipeline (P0, primary playback)

```
EML tree → evaluate 2048 points → dcRemove → FFT → real[] + imag[] → createPeriodicWave → OscillatorNode
```

- Hardware anti-aliased, perfect loop, pitch-independent
- Click/pop free by construction (inherently periodic)

### FFT (P0, inline)

Radix-2 Cooley-Tukey, ~50-80 lines. 2048-point = 11 butterfly stages. No external dependency.

### WAV Export (P0)

16-bit PCM, little-endian, 44-byte RIFF header + samples. Use `DataView` for portability.

### Barrel Export (`index.ts`)

```typescript
export type { Waveform, WavetableFrame, PlaybackOpts, WavExportOpts } from './types.js';
export { generateWaveform, batchGenerate } from './generator.js';
export { dcRemove, peakNormalize, isSilent } from './normalize.js';
export { fft, realFFT } from './fft.js';
export { spectralFlatness, crestFactor } from './analysis.js';
export { createPeriodicWave, createOscillator } from './playback.js';
export { exportWAV } from './export/wav-export.js';
```

## Test Strategy

Playback tests (`createPeriodicWave`, `createOscillator`) need AudioContext — mark as `test.skip`. All other tests (generator, normalize, FFT, WAV, analysis) are pure math.

## Verification

```bash
bun run --filter @eml-fn/wavetable-synth build
bun run --filter @eml-fn/wavetable-synth test
bun run --filter @eml-fn/wavetable-synth lint
```
