import { eml, safeEml } from "./eml.js";
import type { EmlTree, SafeOpts } from "./types.js";

/** Evaluate an EML tree with the given variable bindings. Throws RangeError on unbound variable. */
export function evaluate(tree: EmlTree, vars: Record<string, number>): number {
  switch (tree.type) {
    case "const":
      return tree.value;
    case "var": {
      if (!(tree.name in vars)) {
        throw new RangeError(`Unbound variable: '${tree.name}'`);
      }
      return vars[tree.name];
    }
    case "eml":
      return eml(evaluate(tree.left, vars), evaluate(tree.right, vars));
  }
}

/** Evaluate an EML tree using safe (clamped) EML. Never returns NaN for well-formed trees with finite bindings. */
export function safeEvaluate(
  tree: EmlTree,
  vars: Record<string, number>,
  opts?: SafeOpts,
): number {
  switch (tree.type) {
    case "const":
      return tree.value;
    case "var": {
      if (!(tree.name in vars)) {
        throw new RangeError(`Unbound variable: '${tree.name}'`);
      }
      return vars[tree.name];
    }
    case "eml":
      return safeEml(
        safeEvaluate(tree.left, vars, opts),
        safeEvaluate(tree.right, vars, opts),
        opts,
      );
  }
}
