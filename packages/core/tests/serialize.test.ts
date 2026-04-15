import { describe, expect, it } from 'vitest';
import { equals } from '../src/analysis.js';
import { enumerateByNodeCount } from '../src/enumerate.js';
import { fromRPN, toFormula, toRPN } from '../src/serialize.js';
import { constNode, emlNode, varNode } from '../src/types.js';

describe('toRPN', () => {
  it('const(1) → "1"', () => {
    expect(toRPN(constNode(1))).toBe('1');
  });

  it('var(x) → "x"', () => {
    expect(toRPN(varNode('x'))).toBe('x');
  });

  it('eml(1,1) → "11E"', () => {
    expect(toRPN(emlNode(constNode(1), constNode(1)))).toBe('11E');
  });

  it('eml(eml(1,1), 1) → "11E1E"', () => {
    const tree = emlNode(emlNode(constNode(1), constNode(1)), constNode(1));
    expect(toRPN(tree)).toBe('11E1E');
  });
});

describe('fromRPN', () => {
  it('fromRPN("11E") produces eml(const(1), const(1))', () => {
    const tree = fromRPN('11E');
    expect(tree).toEqual(emlNode(constNode(1), constNode(1)));
  });

  it('throws on empty string', () => {
    expect(() => fromRPN('')).toThrow(SyntaxError);
  });

  it('throws on stack underflow', () => {
    expect(() => fromRPN('EEE')).toThrow(SyntaxError);
    expect(() => fromRPN('EEE')).toThrow('Stack underflow');
  });

  it('throws on leftover stack items', () => {
    expect(() => fromRPN('111')).toThrow(SyntaxError);
    expect(() => fromRPN('111')).toThrow('expected 1 item on stack');
  });
});

describe('toRPN roundtrip', () => {
  it('roundtrips for all n=2 trees with [1, x]', () => {
    for (const tree of enumerateByNodeCount(2, ['1', 'x'])) {
      const rpn = toRPN(tree);
      const restored = fromRPN(rpn);
      expect(equals(restored, tree)).toBe(true);
    }
  });
});

describe('toFormula', () => {
  it('toFormula(fromRPN("11E")) === "exp(1) - ln(1)"', () => {
    expect(toFormula(fromRPN('11E'))).toBe('exp(1) - ln(1)');
  });

  it('toFormula(fromRPN("x1E")) === "exp(x) - ln(1)"', () => {
    expect(toFormula(fromRPN('x1E'))).toBe('exp(x) - ln(1)');
  });

  it('nested formula is correct', () => {
    const tree = fromRPN('11E1E');
    expect(toFormula(tree)).toBe('exp(exp(1) - ln(1)) - ln(1)');
  });
});
