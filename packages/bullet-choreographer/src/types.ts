import type { EmlTree } from "@eml-fn/core";

/** A pair of EML trees defining x(t,i) and y(t,i) bullet trajectories */
export interface PatternPair {
  /** EML tree for x-position as function of t (time) and i (bullet index) */
  xTree: EmlTree;
  /** EML tree for y-position as function of t (time) and i (bullet index) */
  yTree: EmlTree;
  /** Auto-generated tags describing trajectory shape */
  tags?: TagName[];
  /** Computed metadata: scores, stability horizon, etc. */
  meta?: Record<string, number>;
}

/** Simulation output: flat Float32Array of [x, y] pairs per bullet per step */
export interface TrajectoryData {
  /** Position data: Float32Array[bullets × steps × 2] (x, y interleaved) */
  positions: Float32Array;
  /** Number of bullets simulated */
  bulletCount: number;
  /** Number of time steps simulated */
  timeSteps: number;
  /** Time delta per step */
  dt: number;
  /** Per-bullet alive flag: false if bullet went NaN/Inf and was killed */
  alive: boolean[];
}

/** Options for simulation */
export interface SimulateOpts {
  /** Use safeEvaluate with clamped exp/ln. Default: true */
  safe?: boolean;
  /** Max exponent input when safe=true. Default: 10 */
  maxExp?: number;
}

/** Options for the degenerate pattern filter pipeline */
export interface FilterOpts {
  /** Number of bullets to simulate. Default: 50 */
  bulletCount?: number;
  /** Number of time steps. Default: 200 */
  timeSteps?: number;
  /** Time delta per step. Default: 0.016 */
  dt?: number;
  /** Reject if all bullets exit ±bounds within oobSteps. Default: 1000 */
  bounds?: number;
  /** Reject if position variance < this (all bullets same spot). Default: 1e-6 */
  staticVariance?: number;
  /** Reject if pairwise distance between all trajectories < this. Default: 1e-4 */
  identicalDistance?: number;
  /** Reject if total position variance < this. Default: 1.0 */
  boringVariance?: number;
  /** Number of initial steps for OOB check. Default: 5 */
  oobSteps?: number;
  /** Simulation options (safe mode, maxExp). */
  simulate?: SimulateOpts;
}

/** Trajectory shape tag names */
export type TagName =
  | "spiral"
  | "fan"
  | "wave"
  | "ring"
  | "chaos"
  | "converge"
  | "diverge";

/** Normalization strategy identifier */
export type NormalizerType = "clamp" | "modular" | "sigmoid" | "adaptive";

/** Options for canvas rendering */
export interface RenderOpts {
  /** Number of bullets. Default: 50 */
  bulletCount?: number;
  /** Number of time steps. Default: 200 */
  timeSteps?: number;
  /** Time delta per step. Default: 0.016 */
  dt?: number;
  /** Trail color. Default: 'rgba(0, 255, 128, 0.6)' */
  color?: string;
  /** Background color. Default: '#000' */
  backgroundColor?: string;
  /** Normalizer to apply. Default: 'modular' */
  normalizer?: NormalizerType;
  /** Bounds for normalizer. Default: canvas width/height */
  bounds?: number;
}

/** Serializable JSON pattern definition */
export interface PatternJSON {
  /** RPN string for x-tree */
  xRPN: string;
  /** RPN string for y-tree */
  yRPN: string;
  /** Auto-generated tags */
  tags?: TagName[];
  /** Computed metadata */
  meta?: Record<string, number>;
}
