# @eml-fn/pattern-lab

> **Status: Coming Soon** — Package scaffold is in place, implementation pending.

WebGL shader art generator powered by the EML function. Compile EML trees into GLSL fragment shaders and render 2D mathematical patterns.

## Planned Features (P0)

- **Shader compilation** — `compileToShader(tree)` → complete WebGL2 GLSL source
- **Canvas rendering** — `renderToCanvas(shader, canvas)` with configurable resolution
- **Thumbnail grid** — Batch render patterns using single shared WebGL context + FBO
- **Normalizers** — sigmoid, tanh, modular (fract), adaptive strategies mapping raw EML to [0,1]
- **Color ramps** — grayscale, viridis, magma, plasma, turbo
- **Export: GLSL** — Copy-pasteable source, Shadertoy `mainImage` wrapper
- **Export: PNG** — Canvas → Blob → download at 256-4096 resolution

## Planned Features (P1)

- Animation support (time uniform)
- UE5 Material Expression export (HLSL)
- React component library (`<PatternGrid>`, `<PatternViewer>`)
- Pattern metadata (brightness, contrast, frequency, symmetry)

## Architecture

```
EML tree → core toGLSL() → shader-compiler wraps in full shader template
  → normalizer function injected → color ramp injected → WebGL2 render
```

See [docs/requirements.md](../../docs/requirements.md) for the full specification.

## License

MIT
