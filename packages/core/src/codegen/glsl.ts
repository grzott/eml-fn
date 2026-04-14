import type { EmlTree } from "../types.js";

export interface GlslOpts {
  /** Variable name mapping. Default: u → uv.x, v → uv.y, t → uTime */
  varMap?: Record<string, string>;
  /** Function name for the generated pattern. Default: 'emlPattern' */
  funcName?: string;
}

const DEFAULT_VAR_MAP: Record<string, string> = {
  u: "uv.x",
  v: "uv.y",
  t: "uTime",
  x: "uv.x",
  y: "uv.y",
};

/**
 * Generate a complete GLSL code string from an EML tree.
 * Includes eml() helper with float32-safe clamps.
 */
export function toGLSL(tree: EmlTree, opts?: GlslOpts): string {
  const varMap = opts?.varMap ?? DEFAULT_VAR_MAP;
  const funcName = opts?.funcName ?? "emlPattern";
  const ctx = new GlslContext(varMap);
  const result = ctx.emit(tree);

  const lines: string[] = [
    "float eml(float x, float y) {",
    "  return exp(clamp(x, -20.0, 20.0)) - log(max(y, 1e-10));",
    "}",
    "",
    "// --- Generated from EML tree ---",
    `float ${funcName}(vec2 uv) {`,
  ];

  for (const decl of ctx.declarations) {
    lines.push(`  ${decl}`);
  }

  lines.push(`  return ${result};`);
  lines.push("}");

  return lines.join("\n");
}

class GlslContext {
  declarations: string[] = [];
  private counter = 0;
  private varMap: Record<string, string>;

  constructor(varMap: Record<string, string>) {
    this.varMap = varMap;
  }

  emit(tree: EmlTree): string {
    switch (tree.type) {
      case "const":
        return formatFloat(tree.value);
      case "var":
        return this.varMap[tree.name] ?? tree.name;
      case "eml": {
        const left = this.emit(tree.left);
        const right = this.emit(tree.right);
        const name = `v${this.counter++}`;
        this.declarations.push(`float ${name} = eml(${left}, ${right});`);
        return name;
      }
    }
  }
}

function formatFloat(v: number): string {
  const s = String(v);
  return s.includes(".") ? s : `${s}.0`;
}
