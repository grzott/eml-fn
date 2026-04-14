# Contributing to eml-fn

## Setup

```bash
git clone https://github.com/user/eml-fn
cd eml-fn
bun install
```

## Development

- `bun run build` — Build all packages
- `bun run test` — Run all tests
- `bun run lint` — Lint all code
- `bun run lint:fix` — Auto-fix lint issues

## Adding a changeset

When you make a change that should be released:

```bash
bun run changeset
```

Follow the prompts to describe your change and select affected packages.

## Code Style

- Biome handles formatting and linting — run `bun run lint:fix` before committing
- TypeScript strict mode is required
- Zero runtime dependencies in `@eml-fn/core`
- React components go in `src/react/` sub-folders (optional peerDependency)
