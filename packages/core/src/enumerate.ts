import type { EmlTree } from './types.js';
import { constNode, emlNode, varNode } from './types.js';

/**
 * Catalan number: C(n) = binomial(2n, n) / (n + 1)
 */
function catalan(n: number): number {
  if (n <= 0) return 1;
  let result = 1;
  for (let i = 0; i < n; i++) {
    result = (result * 2 * (2 * i + 1)) / (i + 2);
  }
  return Math.round(result);
}

/**
 * Create leaf nodes from a leaf type string.
 * '1' produces EmlConst(1), any other string produces EmlVar(name).
 */
function makeLeaf(leafType: string): EmlTree {
  return leafType === '1' ? constNode(1) : varNode(leafType);
}

/**
 * Count trees with exactly `nodes` eml-nodes and `numLeafTypes` leaf types.
 * Formula: catalan(n) * numLeafTypes^(n+1)
 */
export function countTrees(nodes: number, numLeafTypes: number): number {
  return catalan(nodes) * numLeafTypes ** (nodes + 1);
}

/**
 * Enumerate all trees with exactly `n` eml-nodes.
 * Each leaf can be any of the given leaf types.
 * Count for structures = Catalan(n). Count per structure = leafTypes.length^(n+1).
 */
export function* enumerateByNodeCount(n: number, leafTypes: string[]): Generator<EmlTree> {
  if (n === 0) {
    for (const lt of leafTypes) {
      yield makeLeaf(lt);
    }
    return;
  }

  // For n eml-nodes, the root is an eml node with left subtree having i nodes
  // and right subtree having n-1-i nodes, for i = 0..n-1
  for (let i = 0; i < n; i++) {
    const j = n - 1 - i;
    for (const left of collectTrees(i, leafTypes)) {
      for (const right of collectTrees(j, leafTypes)) {
        yield emlNode(left, right);
      }
    }
  }
}

/**
 * Collect all trees into an array (needed for cartesian product in enumeration).
 * Memoization not used to keep memory bounded for large enumerations.
 */
function collectTrees(n: number, leafTypes: string[]): EmlTree[] {
  return [...enumerateByNodeCount(n, leafTypes)];
}

/**
 * Enumerate all full binary EML trees up to the given depth.
 * Each leaf is one of the `leafTypes` ('1' → const(1), others → var(name)).
 * Yields trees at all depths from 0 to `depth`.
 */
export function* enumerate(depth: number, leafTypes: string[]): Generator<EmlTree> {
  // Enumerate by node count: a tree with n nodes has depth between ceil(log2(n+1)) and n.
  // For simplicity, enumerate all trees up to node counts that can fit within the depth,
  // then filter by actual depth.
  // Max nodes at depth d is 2^d - 1 (perfect binary tree), so we enumerate up to that.
  const maxNodes = (1 << depth) - 1; // 2^depth - 1... actually for depth d, max nodes = 2^d - 1

  // But that could be a lot. Alternatively, we generate trees by node count and filter.
  // A tree with n nodes has min depth ceil(log2(n+1)) and max depth n.
  // We want trees with depth <= depth.
  for (let n = 0; n <= maxNodes; n++) {
    for (const tree of enumerateByNodeCount(n, leafTypes)) {
      if (treeDepth(tree) <= depth) {
        yield tree;
      }
    }
  }
}

/** Helper to compute tree depth */
function treeDepth(tree: EmlTree): number {
  switch (tree.type) {
    case 'const':
    case 'var':
      return 0;
    case 'eml':
      return 1 + Math.max(treeDepth(tree.left), treeDepth(tree.right));
  }
}
