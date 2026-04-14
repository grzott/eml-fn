import type { EmlTree } from "../types.js";

/** Generate C++ code using <cmath> from an EML tree. */
export function toCpp(tree: EmlTree): string {
  const lines: string[] = [
    "#include <cmath>",
    "",
    "double eml(double x, double y) {",
    "    return std::exp(x) - std::log(y);",
    "}",
    "",
  ];

  const ctx = new CppContext();
  const result = ctx.emit(tree);

  for (const decl of ctx.declarations) {
    lines.push(decl);
  }

  lines.push(`double result = ${result};`);

  return lines.join("\n");
}

class CppContext {
  declarations: string[] = [];
  private counter = 0;

  emit(tree: EmlTree): string {
    switch (tree.type) {
      case "const":
        return formatDouble(tree.value);
      case "var":
        return tree.name;
      case "eml": {
        const left = this.emit(tree.left);
        const right = this.emit(tree.right);
        const name = `v${this.counter++}`;
        this.declarations.push(`double ${name} = eml(${left}, ${right});`);
        return name;
      }
    }
  }
}

function formatDouble(v: number): string {
  const s = String(v);
  return s.includes(".") ? s : `${s}.0`;
}
