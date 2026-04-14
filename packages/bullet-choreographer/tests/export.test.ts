import { constNode, emlNode, equals, toRPN, varNode } from '@eml-fn/core';
import { describe, expect, it } from 'vitest';
import { exportJSON, importJSON } from '../src/export/json-export.js';
import { exportTypescript } from '../src/export/typescript-export.js';
import type { PatternPair } from '../src/types.js';

describe('exportTypescript', () => {
  it('produces valid function string with bulletPos', () => {
    const pair: PatternPair = {
      xTree: emlNode(varNode('t'), constNode(1)),
      yTree: varNode('i'),
    };
    const code = exportTypescript(pair);

    expect(code).toContain('function bulletPos(t: number, i: number, n: number)');
    expect(code).toContain('function eml(x: number, y: number): number');
    expect(code).toContain('return [x, y]');
    expect(code).toContain('Math.exp');
    expect(code).toContain('Math.log');
  });

  it('includes correct EML formulas for both axes', () => {
    const pair: PatternPair = {
      xTree: constNode(1),
      yTree: constNode(1),
    };
    const code = exportTypescript(pair);
    // For const(1), toFormula returns '1'
    expect(code).toContain('const x = 1');
    expect(code).toContain('const y = 1');
  });

  it('produces code with eml helper function', () => {
    const pair: PatternPair = {
      xTree: emlNode(varNode('t'), varNode('i')),
      yTree: constNode(1),
    };
    const code = exportTypescript(pair);
    expect(code).toContain('Math.exp(x) - Math.log(y)');
  });
});

describe('exportJSON', () => {
  it('exports pair as serializable JSON with RPN strings', () => {
    const pair: PatternPair = {
      xTree: emlNode(varNode('t'), constNode(1)),
      yTree: varNode('i'),
    };
    const json = exportJSON(pair);

    expect(json.xRPN).toBe(toRPN(pair.xTree));
    expect(json.yRPN).toBe(toRPN(pair.yTree));
  });

  it('includes tags and meta when present', () => {
    const pair: PatternPair = {
      xTree: constNode(1),
      yTree: constNode(1),
      tags: ['spiral', 'diverge'],
      meta: { score: 0.85 },
    };
    const json = exportJSON(pair);

    expect(json.tags).toEqual(['spiral', 'diverge']);
    expect(json.meta).toEqual({ score: 0.85 });
  });

  it('round-trips through exportJSON / importJSON', () => {
    const pair: PatternPair = {
      xTree: emlNode(varNode('t'), emlNode(constNode(1), varNode('i'))),
      yTree: emlNode(constNode(1), constNode(1)),
      tags: ['wave'],
      meta: { complexity: 3 },
    };
    const json = exportJSON(pair);
    const restored = importJSON(json);

    expect(equals(restored.xTree, pair.xTree)).toBe(true);
    expect(equals(restored.yTree, pair.yTree)).toBe(true);
    expect(restored.tags).toEqual(['wave']);
    expect(restored.meta).toEqual({ complexity: 3 });
  });

  it('handles pair without tags and meta', () => {
    const pair: PatternPair = {
      xTree: constNode(1),
      yTree: constNode(1),
    };
    const json = exportJSON(pair);

    expect(json.tags).toBeUndefined();
    expect(json.meta).toBeUndefined();

    const restored = importJSON(json);
    expect(restored.tags).toBeUndefined();
    expect(restored.meta).toBeUndefined();
  });
});
