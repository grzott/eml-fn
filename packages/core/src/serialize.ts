import type { EmlTree } from "./types.js";
import { constNode, emlNode, varNode } from "./types.js";

const DEFAULT_VAR_NAMES = ["x", "y", "z", "t", "u", "v", "i", "n"];

/**
 * Convert tree to RPN string.
 * Const(1) → '1', Var('x') → 'x', Eml(left, right) → toRPN(left) + toRPN(right) + 'E'
 */
export function toRPN(tree: EmlTree): string {
  switch (tree.type) {
    case "const":
      return String(tree.value);
    case "var":
      return tree.name;
    case "eml":
      return `${toRPN(tree.left)}${toRPN(tree.right)}E`;
  }
}

/**
 * Parse RPN string back to tree.
 * Tokens: '1' → const(1), 'E' → pop two and make eml node, single char → var.
 * Throws on malformed input.
 */
export function fromRPN(program: string, varNames?: string[]): EmlTree {
  if (program.length === 0) {
    throw new SyntaxError("Empty RPN program");
  }

  const vars = new Set(varNames ?? DEFAULT_VAR_NAMES);
  const stack: EmlTree[] = [];

  for (const ch of program) {
    if (ch === "E") {
      if (stack.length < 2) {
        throw new SyntaxError(
          "Stack underflow: not enough operands for E operator",
        );
      }
      const right = stack.pop() as EmlTree;
      const left = stack.pop() as EmlTree;
      stack.push(emlNode(left, right));
    } else if (ch === "1") {
      stack.push(constNode(1));
    } else if (vars.has(ch)) {
      stack.push(varNode(ch));
    } else {
      throw new SyntaxError(`Unknown token: '${ch}'`);
    }
  }

  if (stack.length !== 1) {
    throw new SyntaxError(
      `Invalid RPN: expected 1 item on stack, got ${stack.length}`,
    );
  }

  return stack[0];
}

/**
 * Convert tree to human-readable infix formula.
 * Example: eml(eml(1,x), 1) → "exp(exp(1) - ln(x)) - ln(1)"
 */
export function toFormula(tree: EmlTree): string {
  switch (tree.type) {
    case "const":
      return String(tree.value);
    case "var":
      return tree.name;
    case "eml": {
      const left = toFormula(tree.left);
      const right = toFormula(tree.right);
      return `exp(${left}) - ln(${right})`;
    }
  }
}
