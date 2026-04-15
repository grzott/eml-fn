# Package Requirements

Consolidated requirements for all packages. Distilled from the full audit (`daily-bot/domains/eml/notes/2026-04-14-four-libs-requirements-audit.md`).

## Priority Levels

- **P0 (Must-Have)**: Required for initial release. Non-negotiable.
- **P1 (Should-Have)**: High value, implement after P0 is stable.
- **P2 (Nice-to-Have)**: Future enhancements.

---

## `@eml-fn/core` — ✅ Done

Zero-dependency shared foundation. Full API in [packages/core/README.md](../packages/core/README.md).

**All P0 requirements met**: EmlTree type, evaluate/safeEvaluate, enumerate, toRPN/fromRPN, toFormula, kComplexity, equals. All P1 codegen backends (GLSL, HLSL, TypeScript, Python, C++) implemented. ~65 tests passing.

---

## `@eml-fn/pattern-lab` — ⬜ Ready

WebGL shader art generator. EML trees → GLSL fragment shaders → 2D patterns.

### P0 Requirements

| ID | Requirement | Acceptance Criteria |
|----|------------|-------------------|
| P-01 | `compileToShader(tree, opts?)` → complete GLSL source | Compiles in WebGL2, includes `eml()` helper + `main()` |
| P-02 | `renderToCanvas(shader, canvas, opts?)` | <16ms for 256×256 |
| P-03 | `renderThumbnails(trees, container, opts?)` — batch grid | 81 patterns without frame drops, single WebGL context + FBO |
| P-04 | Input domain mapping — configurable UV range | Default [0,1], support [-π,π], [-1,1] |
| P-05 | Output normalization — sigmoid, tanh, modular, adaptive | Handle Inf/NaN → error color (default black) |
| P-06 | Export: GLSL source | Copy-pasteable into Shadertoy |
| P-07 | Export: PNG image | Canvas → Blob → download, 256-4096 resolution |
| P-08 | Only depends on `@eml-fn/core` + platform WebGL | No Three.js |

### P1 Requirements

| ID | Requirement |
|----|------------|
| P-10 | Color ramp system (grayscale, viridis, magma, plasma, turbo) |
| P-11 | Export: Shadertoy link (mainImage wrapper) |
| P-12 | Export: UE5 Material Expression (HLSL) |
| P-14 | Animation support (time uniform) |
| P-15 | React component library (`<PatternGrid>`, `<PatternViewer>`) |
| P-16 | Pattern metadata (brightness, contrast, frequency, symmetry) |

### Key Hazards

- **GPU float32**: Clamp exp input at ±20.0 (not 88.0 — nested EML overflows)
- **WebGL context limit**: Single shared context + FBO for thumbnails
- **Batch perf**: Chunk 16 patterns per rAF frame
- **GPU log pitfalls**: `log(max(abs(y), 1e-10))` always

### File Structure

```
packages/pattern-lab/src/
├── types.ts              # NormalizerStrategy, InputMapping, ShaderOpts, RenderOpts
├── shader-compiler.ts    # compileToShader — wraps core's toGLSL()
├── renderer.ts           # renderToCanvas — WebGL2 render
├── thumbnail-grid.ts     # renderThumbnails — single ctx + FBO
├── normalizers.ts        # sigmoid, tanh, modular, adaptive (GLSL snippets)
├── color-ramps.ts        # grayscale, viridis, magma, plasma, turbo
├── export/
│   ├── glsl-export.ts    # Shadertoy mainImage wrapper
│   └── png-export.ts     # Canvas → Blob → download
├── react/
│   └── index.tsx
└── index.ts              # Barrel export
```

---

## `@eml-fn/bullet-choreographer` — ✅ Done

Full pipeline implemented with safe evaluation, sampled generation, 6-stage filter, auto-tagging, 4 normalizers, and TypeScript/JSON exports. 45 tests passing. Playground app with interactive demo.

See [packages/bullet-choreographer/README.md](../packages/bullet-choreographer/README.md) for full API.

---

## `@eml-fn/wavetable-synth` — ⬜ Ready

EML trees → waveforms → Web Audio PeriodicWave playback + WAV export.

### P0 Requirements

| ID | Requirement | Acceptance Criteria |
|----|------------|-------------------|
| W-01 | `generateWaveform(tree, cycleLength?)` → Float32Array | Default 2048 samples over [0, 2π], DC-removed, peak-normalized |
| W-02 | `dcRemove(waveform)` — subtract mean | Mean ≈ 0 within float tolerance |
| W-03 | `peakNormalize(waveform)` — scale max(abs) = 1.0 | Silent waveforms detected, not normalized |
| W-04 | `isSilent(waveform, tolerance?)` | Detect constant-value waveforms |
| W-05 | FFT — radix-2 Cooley-Tukey, inline (~50-80 lines) | 2048-point, no external deps |
| W-06 | `createPeriodicWave(ctx, waveform)` via FFT | Hardware anti-aliased, perfect loop |
| W-07 | `createOscillator(ctx, waveform, freq)` | Plays at any frequency without aliasing |
| W-08 | `spectralFlatness()` + `crestFactor()` | Sine ≈ 0 flat / √2 crest; noise ≈ 1 flat / ~1 crest |
| W-09 | WAV export — 16-bit PCM, valid RIFF header | 44 byte header + samples×2 bytes |
| W-10 | `batchGenerate(trees)` — bulk waveform generation | 256 waveforms in <100ms |

### P1 Requirements

| ID | Requirement |
|----|------------|
| W-20 | ADSR envelope via GainNode automation |
| W-21 | Biquad filter wrapper |
| W-22 | Waveform morph: (1-α)·wA + α·wB |
| W-23 | Serum wavetable export (32-bit float WAV + clm chunk) |
| W-24 | React components (WaveformGrid, Keyboard) |

### Key Hazards

- **DC offset → speaker damage**: Mandatory `dcRemove()` before any playback
- **Silent waveform normalization**: Detect with `isSilent()`, skip normalize (avoid div/0)
- **AudioContext autoplay policy**: User must call `ctx.resume()` after gesture
- **Harsh harmonics**: PeriodicWave path handles anti-aliasing natively
- **Click/pop at loop boundary**: PeriodicWave is inherently periodic — no clicks

### PeriodicWave Pipeline

```
EML tree → evaluate 2048 points → dcRemove → FFT → real[] + imag[] → createPeriodicWave → OscillatorNode
```

### WAV Export Spec (16-bit PCM, little-endian)

| Offset | Size | Field | Value |
|--------|------|-------|-------|
| 0 | 4 | ChunkID | "RIFF" |
| 4 | 4 | ChunkSize | 36 + DataSize |
| 8 | 4 | Format | "WAVE" |
| 12 | 4 | Subchunk1ID | "fmt " |
| 16 | 4 | Subchunk1Size | 16 |
| 20 | 2 | AudioFormat | 1 (PCM) |
| 22 | 2 | NumChannels | 1 (mono) |
| 24 | 4 | SampleRate | 44100 |
| 28 | 4 | ByteRate | 88200 |
| 32 | 2 | BlockAlign | 2 |
| 34 | 2 | BitsPerSample | 16 |
| 36 | 4 | Subchunk2ID | "data" |
| 40 | 4 | Subchunk2Size | NumSamples × 2 |
| 44 | ... | Data | Int16 samples |

### File Structure

```
packages/wavetable-synth/src/
├── types.ts          # Waveform, WavetableFrame, PlaybackOpts, WavExportOpts
├── generator.ts      # generateWaveform, batchGenerate
├── normalize.ts      # dcRemove, peakNormalize, isSilent
├── fft.ts            # radix-2 Cooley-Tukey FFT (inline, ~50-80 lines)
├── playback.ts       # createOscillator, createPeriodicWave
├── analysis.ts       # spectralFlatness, crestFactor
├── export/
│   └── wav-export.ts # 16-bit PCM WAV
├── react/
│   └── index.tsx
└── index.ts          # Barrel export
```

---

## Cross-Cutting Concerns

### Performance Budgets

| Operation | Target |
|-----------|--------|
| `evaluate()` single tree | <0.01ms |
| `compileToShader()` | <1ms |
| `renderToCanvas(256×256)` | <16ms |
| `renderThumbnails(81)` | No frame drops |
| `simulate(50 bullets, 200 steps)` | <5ms per pattern |
| `generateWaveform(2048)` | <1ms |
| `fft(2048)` | <1ms |
| `exportWAV(2048)` | <1ms |
| `batchGenerate(256 waveforms)` | <100ms |

### Test Strategy

- **Pure math tests**: Run in Bun/Node via Vitest
- **Browser API tests** (WebGL, Canvas2D, Web Audio): Mark as `test.skip` with `// TODO: Playwright E2E`
- **Test naming**: `<module>.test.ts` in `tests/` directory
- **Coverage**: Every public function has at least one test. Edge cases (NaN, Infinity, empty input) covered.
