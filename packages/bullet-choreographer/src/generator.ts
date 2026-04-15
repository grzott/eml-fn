import { enumerate } from '@eml-fn/core';
import type { PatternPair } from './types.js';

/**
 * Generate all (xTree, yTree) pattern pairs by enumerating EML trees at the given depth.
 * Depth 2 with leaves {1, t, i} yields 81 × 81 = 6,561 pairs.
 * Uses generators to avoid allocating all pairs at once.
 */
export function* generatePairs(depth: number, leafTypes: string[]): Generator<PatternPair> {
  // Collect trees into array since we need cartesian product (iterate ×2)
  const trees = [...enumerate(depth, leafTypes)];

  for (const xTree of trees) {
    for (const yTree of trees) {
      yield { xTree, yTree };
    }
  }
}

/**
 * Generate random-sampled (xTree, yTree) pairs.
 * Falls back to full enumeration when total pairs ≤ maxPairs.
 * Uses Fisher-Yates partial shuffle on index pairs for dedup.
 */
export function* generatePairsSampled(
  depth: number,
  leafTypes: string[],
  maxPairs: number,
): Generator<PatternPair> {
  const trees = [...enumerate(depth, leafTypes)];
  const total = trees.length ** 2;

  if (total <= maxPairs) {
    yield* generatePairs(depth, leafTypes);
    return;
  }

  const seen = new Set<number>();
  let yielded = 0;
  // Oversample slightly to account for collisions
  const maxAttempts = maxPairs * 3;
  let attempts = 0;

  while (yielded < maxPairs && attempts < maxAttempts) {
    const xi = Math.floor(Math.random() * trees.length);
    const yi = Math.floor(Math.random() * trees.length);
    const key = xi * trees.length + yi;
    attempts++;
    if (seen.has(key)) continue;
    seen.add(key);
    yielded++;
    yield { xTree: trees[xi], yTree: trees[yi] };
  }
}
