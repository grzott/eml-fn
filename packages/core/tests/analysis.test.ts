import { describe, expect, it } from 'vitest';
import { depth, equals, kComplexity, leafCount, nodeCount, walk } from '../src/analysis.js';
import { fromRPN } from '../src/serialize.js';
import { constNode, emlNode, varNode } from '../src/types.js';

describe('kComplexity', () => {
  it('const(1) = 1', () => {
    expect(kComplexity(constNode(1))).toBe(1);
  });

  it('eml(1,1) = 3', () => {
    expect(kComplexity(emlNode(constNode(1), constNode(1)))).toBe(3);
  });

  it('fromRPN("11xE1EE") = 7', () => {
    expect(kComplexity(fromRPN('11xE1EE'))).toBe(7);
  });
});

describe('depth', () => {
  it('const(1) = 0', () => {
    expect(depth(constNode(1))).toBe(0);
  });

  it('eml(1,1) = 1', () => {
    expect(depth(emlNode(constNode(1), constNode(1)))).toBe(1);
  });

  it('eml(eml(1,1), 1) = 2', () => {
    expect(depth(emlNode(emlNode(constNode(1), constNode(1)), constNode(1)))).toBe(2);
  });
});

describe('nodeCount', () => {
  it('const(1) = 0', () => {
    expect(nodeCount(constNode(1))).toBe(0);
  });

  it('eml(eml(1,1), 1) = 2', () => {
    expect(nodeCount(emlNode(emlNode(constNode(1), constNode(1)), constNode(1)))).toBe(2);
  });
});

describe('leafCount', () => {
  it('const(1) = 1', () => {
    expect(leafCount(constNode(1))).toBe(1);
  });

  it('eml(1,1) = 2', () => {
    expect(leafCount(emlNode(constNode(1), constNode(1)))).toBe(2);
  });

  it('eml(eml(1,1), 1) = 3', () => {
    expect(leafCount(emlNode(emlNode(constNode(1), constNode(1)), constNode(1)))).toBe(3);
  });
});

describe('equals', () => {
  it('constNode(1) === constNode(1)', () => {
    expect(equals(constNode(1), constNode(1))).toBe(true);
  });

  it('constNode(1) !== varNode("x")', () => {
    expect(equals(constNode(1), varNode('x'))).toBe(false);
  });

  it('constNode(1) !== constNode(2)', () => {
    expect(equals(constNode(1), constNode(2))).toBe(false);
  });

  it('same tree structure is equal', () => {
    const a = emlNode(constNode(1), varNode('x'));
    const b = emlNode(constNode(1), varNode('x'));
    expect(equals(a, b)).toBe(true);
  });

  it('different tree structure is not equal', () => {
    const a = emlNode(constNode(1), varNode('x'));
    const b = emlNode(varNode('x'), constNode(1));
    expect(equals(a, b)).toBe(false);
  });
});

describe('walk', () => {
  it('counts leaves via walk', () => {
    const tree = emlNode(emlNode(constNode(1), constNode(1)), varNode('x'));
    const count = walk<number>(tree, {
      const: () => 1,
      var: () => 1,
      eml: (_node, left, right) => left + right,
    });
    expect(count).toBe(3);
  });

  it('collects variable names', () => {
    const tree = emlNode(varNode('x'), emlNode(constNode(1), varNode('y')));
    const names: string[] = [];
    walk<void>(tree, {
      var: (node) => {
        names.push(node.name);
      },
      eml: () => {},
    });
    expect(names).toEqual(['x', 'y']);
  });
});
