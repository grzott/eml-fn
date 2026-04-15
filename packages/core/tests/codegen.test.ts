import { describe, expect, it } from 'vitest';
import { toCpp } from '../src/codegen/cpp.js';
import { toGLSL } from '../src/codegen/glsl.js';
import { toHLSL } from '../src/codegen/hlsl.js';
import { toPython } from '../src/codegen/python.js';
import { toTypescript } from '../src/codegen/typescript.js';
import { fromRPN } from '../src/serialize.js';

describe('toGLSL', () => {
  it('contains exp and log', () => {
    const code = toGLSL(fromRPN('11E'));
    expect(code).toContain('exp(');
    expect(code).toContain('log(');
  });

  it('produces valid structure with eml helper', () => {
    const code = toGLSL(fromRPN('11E'));
    expect(code).toContain('float eml(float x, float y)');
    expect(code).toContain('clamp(x, -20.0, 20.0)');
    expect(code).toContain('max(y, 1e-10)');
  });

  it('maps variables to uv coordinates', () => {
    const code = toGLSL(fromRPN('u1E'));
    expect(code).toContain('uv.x');
  });

  it('has matching braces', () => {
    const code = toGLSL(fromRPN('uv1EE'));
    const opens = (code.match(/{/g) || []).length;
    const closes = (code.match(/}/g) || []).length;
    expect(opens).toBe(closes);
  });
});

describe('toHLSL', () => {
  it('contains exp and log', () => {
    const code = toHLSL(fromRPN('11E'));
    expect(code).toContain('exp(');
    expect(code).toContain('log(');
  });

  it('uses float2 for UE5 compatibility', () => {
    const code = toHLSL(fromRPN('u1E'));
    expect(code).toContain('float2 uv');
  });
});

describe('toTypescript', () => {
  it('contains Math.exp and Math.log', () => {
    const code = toTypescript(fromRPN('x1E'));
    expect(code).toContain('Math.exp');
    expect(code).toContain('Math.log');
  });

  it('uses variable names directly', () => {
    const code = toTypescript(fromRPN('x1E'));
    expect(code).toContain('eml(x, 1)');
  });
});

describe('toPython', () => {
  it('contains np.exp and np.log', () => {
    const code = toPython(fromRPN('x1E'));
    expect(code).toContain('np.exp');
    expect(code).toContain('np.log');
  });

  it('imports numpy', () => {
    const code = toPython(fromRPN('x1E'));
    expect(code).toContain('import numpy as np');
  });
});

describe('toCpp', () => {
  it('contains std::exp and std::log', () => {
    const code = toCpp(fromRPN('x1E'));
    expect(code).toContain('std::exp');
    expect(code).toContain('std::log');
  });

  it('includes cmath', () => {
    const code = toCpp(fromRPN('x1E'));
    expect(code).toContain('#include <cmath>');
  });
});
