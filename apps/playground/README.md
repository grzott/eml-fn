# Playground

Interactive demo app for the eml-fn ecosystem. Built with Vite 6 + React 19.

## Run

```bash
cd apps/playground
bun install
bun dev
# → http://localhost:5173
```

Or from the monorepo root:

```bash
bun run --filter playground dev
```

## Features

### Bullet Choreographer Explorer

- **Depth selector** — 1 (quick), 2 (medium), 3 (deep, sampled)
- **Leaf type toggles** — 1 (constant), t (time), i (bullet index), n (count), τ (2π)
- **Gallery view** — Thumbnail grid with tag filtering (wave, ring, chaos, converge)
- **Detail panel** — Full-size render with configurable normalizer (adaptive, modular, clamp, sigmoid), bullet count, and step count
- **Export** — TypeScript function and JSON definition with copy-to-clipboard
- **Dark theme** UI

## Tech Stack

- [Vite](https://vite.dev/) 6 — dev server + build
- [React](https://react.dev/) 19 — UI
- [@eml-fn/core](../packages/core) — EML tree engine
- [@eml-fn/bullet-choreographer](../packages/bullet-choreographer) — pattern pipeline

## Adding New Tabs

When `@eml-fn/pattern-lab` and `@eml-fn/wavetable-synth` are implemented, add tabs for:
- **Pattern Lab** — WebGL shader pattern gallery
- **Wavetable Synth** — Waveform browser with audio playback

## License

MIT
