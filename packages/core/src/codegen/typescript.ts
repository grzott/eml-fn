import type { EmlTree } from '../types.js';

/** Generate standalone TypeScript code from an EML tree. No @eml-fn/core dependency. */
export function toTypescript(tree: EmlTree): string {
  const lines: string[] = [
    'function eml(x: number, y: number): number {',
    '  return Math.exp(x) - Math.log(y);',
    '}',
    '',
  ];

  const ctx = new TsContext();
  const result = ctx.emit(tree);

  for (const decl of ctx.declarations) {
    lines.push(decl);
  }

  lines.push(`const result = ${result};`);

  return lines.join('\n');
}

class TsContext {
  declarations: string[] = [];
  private counter = 0;

  emit(tree: EmlTree): string {
    switch (tree.type) {
      case 'const':
        return String(tree.value);
      case 'var':
        return tree.name;
      case 'eml': {
        const left = this.emit(tree.left);
        const right = this.emit(tree.right);
        const name = `v${this.counter++}`;
        this.declarations.push(`const ${name} = eml(${left}, ${right});`);
        return name;
      }
    }
  }
}
