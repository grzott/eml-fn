import type { EmlTree, TreeVisitor } from './types.js';

/**
 * K-complexity = RPN length = 2*nodeCount + 1 (always odd).
 * Equivalent to the number of symbols in the RPN representation.
 */
export function kComplexity(tree: EmlTree): number {
  switch (tree.type) {
    case 'const':
    case 'var':
      return 1;
    case 'eml':
      return kComplexity(tree.left) + kComplexity(tree.right) + 1;
  }
}

/** Max depth from root. Leaves have depth 0. */
export function depth(tree: EmlTree): number {
  switch (tree.type) {
    case 'const':
    case 'var':
      return 0;
    case 'eml':
      return 1 + Math.max(depth(tree.left), depth(tree.right));
  }
}

/** Count of eml (internal) nodes only. */
export function nodeCount(tree: EmlTree): number {
  switch (tree.type) {
    case 'const':
    case 'var':
      return 0;
    case 'eml':
      return 1 + nodeCount(tree.left) + nodeCount(tree.right);
  }
}

/** Count of leaf nodes (const + var). */
export function leafCount(tree: EmlTree): number {
  switch (tree.type) {
    case 'const':
    case 'var':
      return 1;
    case 'eml':
      return leafCount(tree.left) + leafCount(tree.right);
  }
}

/** Deep structural equality comparison. */
export function equals(a: EmlTree, b: EmlTree): boolean {
  if (a.type !== b.type) return false;
  switch (a.type) {
    case 'const':
      return a.value === (b as typeof a).value;
    case 'var':
      return a.name === (b as typeof a).name;
    case 'eml':
      return equals(a.left, (b as typeof a).left) && equals(a.right, (b as typeof a).right);
  }
}

/** Post-order tree traversal. Returns the result from the root node's visitor call. */
export function walk<T>(tree: EmlTree, visitor: TreeVisitor<T>): T {
  switch (tree.type) {
    case 'const':
      return visitor.const ? visitor.const(tree) : (undefined as T);
    case 'var':
      return visitor.var ? visitor.var(tree) : (undefined as T);
    case 'eml': {
      const leftResult = walk(tree.left, visitor);
      const rightResult = walk(tree.right, visitor);
      return visitor.eml ? visitor.eml(tree, leftResult, rightResult) : (undefined as T);
    }
  }
}
