import { toFormula } from '@eml-fn/core';
import type { PatternPair } from '../types.js';

/**
 * Generate a standalone TypeScript function string for a bullet pattern.
 * The exported function computes (x, y) position given time t, bullet index i,
 * and total bullet count n.
 */
export function exportTypescript(pair: PatternPair): string {
  const xFormula = toFormula(pair.xTree);
  const yFormula = toFormula(pair.yTree);

  return `function eml(x: number, y: number): number {
  return Math.exp(x) - Math.log(y);
}

function bulletPos(t: number, i: number, n: number): [number, number] {
  const x = ${xFormula};
  const y = ${yFormula};
  return [x, y];
}`;
}
