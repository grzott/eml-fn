// Types
export type {
  PatternPair,
  TrajectoryData,
  FilterOpts,
  SimulateOpts,
  TagName,
  NormalizerType,
  RenderOpts,
  PatternJSON,
} from "./types.js";

// Core pipeline (P0)
export { generatePairs, generatePairsSampled } from "./generator.js";
export { simulate } from "./simulator.js";
export { filterDegenerate } from "./filter.js";
export { autoTag } from "./tagger.js";
export { normalizers, normalizeAdaptive } from "./normalizer.js";

// Rendering (P0)
export { simulateToCanvas } from "./renderer.js";

// Export (P0)
export { exportTypescript } from "./export/typescript-export.js";
export { exportJSON, importJSON } from "./export/json-export.js";

// Export (P1) — uncomment when implemented
// export { exportCpp } from './export/cpp-export.js';
