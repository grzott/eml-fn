// Types
export type {
  EmlTree,
  EmlConst,
  EmlVar,
  EmlNode,
  SafeOpts,
  TreeVisitor,
} from "./types.js";

// Constructors
export { constNode, varNode, emlNode } from "./types.js";

// Core operations
export { eml, safeEml } from "./eml.js";
export { evaluate, safeEvaluate } from "./evaluate.js";

// Enumeration
export { enumerate, enumerateByNodeCount, countTrees } from "./enumerate.js";

// Serialization
export { toRPN, fromRPN, toFormula } from "./serialize.js";

// Analysis
export {
  kComplexity,
  depth,
  nodeCount,
  leafCount,
  equals,
  walk,
} from "./analysis.js";

// Code generation
export { toGLSL } from "./codegen/glsl.js";
export { toHLSL } from "./codegen/hlsl.js";
export { toTypescript } from "./codegen/typescript.js";
export { toPython } from "./codegen/python.js";
export { toCpp } from "./codegen/cpp.js";
