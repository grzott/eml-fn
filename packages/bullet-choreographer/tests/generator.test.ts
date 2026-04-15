import { enumerate } from '@eml-fn/core';
import { describe, expect, it } from 'vitest';
import { generatePairs, generatePairsSampled } from '../src/generator.js';

describe('generatePairs', () => {
  it('yields correct count for depth 1 with 2 leaf types', () => {
    const trees = [...enumerate(1, ['1', 't'])];
    const expectedCount = trees.length ** 2;
    const pairs = [...generatePairs(1, ['1', 't'])];
    expect(pairs.length).toBe(expectedCount);
  });

  it('yields correct count for depth 2 with 3 leaf types', () => {
    // enumerate(2, ...) returns all trees from depth 0 through 2
    const trees = [...enumerate(2, ['1', 't', 'i'])];
    const expectedPairs = trees.length ** 2;

    let count = 0;
    for (const _pair of generatePairs(2, ['1', 't', 'i'])) {
      count++;
    }
    expect(count).toBe(expectedPairs);
  });

  it('generator yields pairs lazily (does not allocate all at once)', () => {
    const gen = generatePairs(2, ['1', 't', 'i']);
    const first = gen.next();
    expect(first.done).toBe(false);
    expect(first.value).toHaveProperty('xTree');
    expect(first.value).toHaveProperty('yTree');
  });

  it('yields PatternPair objects with xTree and yTree', () => {
    const gen = generatePairs(1, ['1']);
    const result = gen.next();
    expect(result.done).toBe(false);
    const pair = result.value;
    expect(pair.xTree).toBeDefined();
    expect(pair.yTree).toBeDefined();
    expect(pair.xTree.type).toBeDefined();
    expect(pair.yTree.type).toBeDefined();
  });

  it('yields 1 pair for depth 0 with 1 leaf type', () => {
    const pairs = [...generatePairs(0, ['1'])];
    expect(pairs.length).toBe(1);
  });
});

describe('generatePairsSampled', () => {
  it('falls back to full enumeration for small spaces', () => {
    const full = [...generatePairs(1, ['1', 't'])];
    const sampled = [...generatePairsSampled(1, ['1', 't'], 10000)];
    expect(sampled.length).toBe(full.length);
  });

  it('limits output to maxPairs for large spaces', () => {
    const maxPairs = 50;
    const sampled = [...generatePairsSampled(2, ['1', 't', 'i'], maxPairs)];
    expect(sampled.length).toBeLessThanOrEqual(maxPairs);
    expect(sampled.length).toBeGreaterThan(0);
  });

  it('returns unique pairs (no duplicates)', () => {
    const sampled = [...generatePairsSampled(2, ['1', 't', 'i'], 100)];
    const keys = sampled.map((p) => `${JSON.stringify(p.xTree)}|${JSON.stringify(p.yTree)}`);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });
});
