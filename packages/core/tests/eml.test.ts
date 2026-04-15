import { describe, expect, it } from 'vitest';
import { eml, safeEml } from '../src/eml.js';

describe('eml', () => {
  it('eml(0, 1) === 1.0', () => {
    expect(eml(0, 1)).toBe(1.0);
  });

  it('eml(1, 1) ≈ e', () => {
    expect(eml(1, 1)).toBeCloseTo(Math.E, 14);
  });

  it('eml(2, 1) ≈ e²', () => {
    expect(eml(2, 1)).toBeCloseTo(Math.exp(2), 14);
  });

  it('eml(0, Math.E) ≈ 0.0', () => {
    expect(eml(0, Math.E)).toBeCloseTo(0.0, 14);
  });

  it('eml(1, 0) === Infinity', () => {
    expect(eml(1, 0)).toBe(Number.POSITIVE_INFINITY);
  });

  it('eml(-Infinity, 1) === 0', () => {
    expect(eml(Number.NEGATIVE_INFINITY, 1)).toBe(0);
  });

  it('eml(NaN, 1) is NaN', () => {
    expect(Number.isNaN(eml(Number.NaN, 1))).toBe(true);
  });

  it('eml(1, -1) is NaN', () => {
    expect(Number.isNaN(eml(1, -1))).toBe(true);
  });
});

describe('safeEml', () => {
  it('safeEml(1000, 1) is finite', () => {
    expect(Number.isFinite(safeEml(1000, 1))).toBe(true);
  });

  it('safeEml(1, 0) is finite', () => {
    expect(Number.isFinite(safeEml(1, 0))).toBe(true);
  });

  it('safeEml(1, -5) is finite', () => {
    expect(Number.isFinite(safeEml(1, -5))).toBe(true);
  });

  it('safeEml(0, 1) matches raw eml', () => {
    expect(safeEml(0, 1)).toBe(eml(0, 1));
  });

  it('safeEml(1, 1) matches raw eml', () => {
    expect(safeEml(1, 1)).toBeCloseTo(eml(1, 1), 14);
  });

  it('respects custom maxExp', () => {
    const result = safeEml(100, 1, { maxExp: 10 });
    expect(result).toBeCloseTo(Math.exp(10), 10);
  });

  it('never returns NaN for finite inputs', () => {
    const inputs: [number, number][] = [
      [1000, 1],
      [-1000, 1],
      [1, 0],
      [1, -100],
      [0, 0.00001],
      [500, 0.00001],
    ];
    for (const [x, y] of inputs) {
      expect(Number.isNaN(safeEml(x, y))).toBe(false);
    }
  });
});
