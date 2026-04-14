import type { EmlTree } from "../types.js";

/** Generate NumPy-based Python code from an EML tree. */
export function toPython(tree: EmlTree): string {
  const lines: string[] = [
    "import numpy as np",
    "",
    "def eml(x, y):",
    "    return np.exp(x) - np.log(y)",
    "",
  ];

  const ctx = new PyContext();
  const result = ctx.emit(tree);

  for (const decl of ctx.declarations) {
    lines.push(decl);
  }

  lines.push(`result = ${result}`);

  return lines.join("\n");
}

class PyContext {
  declarations: string[] = [];
  private counter = 0;

  emit(tree: EmlTree): string {
    switch (tree.type) {
      case "const":
        return String(tree.value);
      case "var":
        return tree.name;
      case "eml": {
        const left = this.emit(tree.left);
        const right = this.emit(tree.right);
        const name = `v${this.counter++}`;
        this.declarations.push(`${name} = eml(${left}, ${right})`);
        return name;
      }
    }
  }
}
