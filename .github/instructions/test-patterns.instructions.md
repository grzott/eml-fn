---
description: "Test patterns and conventions for eml-fn packages. Applied when writing or editing test files."
applyTo: "packages/*/tests/**"
---

# Test Conventions

## Framework

- **Vitest** with `globals: true` (no need to import `describe`, `it`, `expect`)
- Test files: `<module>.test.ts` in `packages/<pkg>/tests/`
- Import from `../src/<module>.js` (ESM convention)

## Structure

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../src/module.js';

describe('myFunction', () => {
  it('should handle normal input', () => {
    expect(myFunction(input)).toBe(expected);
  });

  it('should handle edge case: NaN', () => {
    expect(myFunction(NaN)).toBeNaN();
  });
});
```

## Coverage Requirements

- Every public function has at least one test
- Edge cases: NaN, Infinity, -Infinity, 0, empty arrays, very large values
- Numerical tolerance: use `toBeCloseTo(expected, decimals)` for floating point

## Browser APIs

Mark tests requiring browser APIs (WebGL, Canvas2D, Web Audio) as:

```typescript
it.skip('should render to canvas', () => {
  // TODO: Playwright E2E
});
```

## Test Vectors (core)

Known-good values for regression testing:

| Tree (RPN) | Input | Expected | Tolerance |
|-----------|-------|----------|-----------|
| `11E` | — | e ≈ 2.71828 | 1e-14 |
| `x1E` | x=2 | e² ≈ 7.38906 | 1e-14 |
| `111E1EE` | — | 0.0 | exact |
