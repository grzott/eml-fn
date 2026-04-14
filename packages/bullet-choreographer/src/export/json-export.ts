import { fromRPN, toRPN } from '@eml-fn/core';
import type { PatternJSON, PatternPair } from '../types.js';

/**
 * Export a PatternPair as a serializable JSON object.
 * Uses RPN strings for tree serialization.
 */
export function exportJSON(pair: PatternPair): PatternJSON {
  return {
    xRPN: toRPN(pair.xTree),
    yRPN: toRPN(pair.yTree),
    tags: pair.tags ? [...pair.tags] : undefined,
    meta: pair.meta ? { ...pair.meta } : undefined,
  };
}

/**
 * Import a PatternPair from a JSON object.
 * Reconstructs EML trees from RPN strings.
 */
export function importJSON(json: PatternJSON): PatternPair {
  return {
    xTree: fromRPN(json.xRPN),
    yTree: fromRPN(json.yRPN),
    tags: json.tags ? [...json.tags] : undefined,
    meta: json.meta ? { ...json.meta } : undefined,
  };
}
