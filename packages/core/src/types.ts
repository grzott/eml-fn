/** Constant leaf node (typically 1.0) */
export interface EmlConst {
  readonly type: "const";
  readonly value: number;
}

/** Variable leaf node */
export interface EmlVar {
  readonly type: "var";
  readonly name: string;
}

/** EML operation node: eml(left, right) = exp(left) - ln(right) */
export interface EmlNode {
  readonly type: "eml";
  readonly left: EmlTree;
  readonly right: EmlTree;
}

/** Discriminated union of all EML tree nodes */
export type EmlTree = EmlConst | EmlVar | EmlNode;

/** Options for safe (clamped) EML evaluation */
export interface SafeOpts {
  /** Maximum value for exp() input. Default: 500 */
  maxExp?: number;
  /** Minimum value for log() argument. Default: 1e-15 */
  minLogArg?: number;
  /** Behavior when clamping occurs. Default: 'silent' */
  onClamp?: "silent" | "warn";
}

/** Tree visitor callbacks */
export interface TreeVisitor<T> {
  const?(node: EmlConst): T;
  var?(node: EmlVar): T;
  eml?(node: EmlNode, leftResult: T, rightResult: T): T;
}

/** Create a constant leaf node */
export function constNode(value: number): EmlConst {
  return { type: "const", value };
}

/** Create a variable leaf node */
export function varNode(name: string): EmlVar {
  return { type: "var", name };
}

/** Create an EML operation node */
export function emlNode(left: EmlTree, right: EmlTree): EmlNode {
  return { type: "eml", left, right };
}
