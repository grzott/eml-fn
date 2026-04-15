# @eml-fn/wavetable-synth

> **Status: Coming Soon** — Package scaffold is in place, implementation pending.

Wavetable synthesizer powered by the EML function. Generate waveforms from EML trees, play them via Web Audio API's PeriodicWave, and export as WAV files.

## Planned Features (P0)

- **Waveform generation** — `generateWaveform(tree)` → 2048-sample Float32Array over [0, 2π]
- **DC removal + peak normalization** — Mandatory signal conditioning before playback
- **FFT** — Radix-2 Cooley-Tukey (inline, no deps) for PeriodicWave creation
- **PeriodicWave playback** — Hardware anti-aliased, click-free looping at any frequency
- **Spectral analysis** — `spectralFlatness()`, `crestFactor()` for waveform classification
- **WAV export** — 16-bit PCM, valid RIFF header, 44100 Hz mono
- **Batch generation** — 256 waveforms in <100ms

## Planned Features (P1)

- ADSR envelope via GainNode automation
- Biquad filter wrapper
- Waveform morphing: (1-α)·wA + α·wB interpolation
- Serum wavetable export (32-bit float WAV + clm chunk)
- React components (WaveformGrid, Keyboard)

## Pipeline

```
EML tree → evaluate 2048 points → dcRemove → peakNormalize → FFT → real[] + imag[]
  → createPeriodicWave → OscillatorNode → speaker
  → exportWAV → 16-bit PCM file
```

See [docs/requirements.md](../../docs/requirements.md) for the full specification.

## License

MIT
