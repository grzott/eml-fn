import type { NormalizerType } from './types.js';

/** Normalizer function signature: maps a value into bounded space */
type NormalizerFn = (value: number, bounds: number) => number;

/** Clamp: simple clamping to [-bounds, bounds] */
function clamp(value: number, bounds: number): number {
  return Math.max(-bounds, Math.min(bounds, value));
}

/** Modular (toroidal): wraps value into [0, bounds) */
function modular(value: number, bounds: number): number {
  return ((value % bounds) + bounds) % bounds;
}

/** Sigmoid: maps infinite range to (-bounds, bounds) via tanh */
function sigmoid(value: number, bounds: number): number {
  return bounds * Math.tanh(value / bounds);
}

/** Adaptive: per-pattern min/max rescale. Applied externally via normalizeAdaptive(). */
function adaptive(value: number, bounds: number): number {
  // When used standalone, behaves like sigmoid as fallback
  return bounds * Math.tanh(value / bounds);
}

/** Map of normalizer name to function */
export const normalizers: Record<NormalizerType, NormalizerFn> = {
  clamp,
  modular,
  sigmoid,
  adaptive,
};

/**
 * Normalize a Float32Array of positions in-place using adaptive min/max rescale.
 * Normalizes x and y axes independently so both fill the canvas.
 * Constant-valued axes are centered at bounds/2.
 */
export function normalizeAdaptive(positions: Float32Array, bounds: number): void {
  // Compute per-axis min/max (positions are x,y interleaved)
  let xMin = Number.POSITIVE_INFINITY;
  let xMax = Number.NEGATIVE_INFINITY;
  let yMin = Number.POSITIVE_INFINITY;
  let yMax = Number.NEGATIVE_INFINITY;

  for (let i = 0; i < positions.length; i += 2) {
    const x = positions[i];
    const y = positions[i + 1];
    if (Number.isFinite(x)) {
      if (x < xMin) xMin = x;
      if (x > xMax) xMax = x;
    }
    if (Number.isFinite(y)) {
      if (y < yMin) yMin = y;
      if (y > yMax) yMax = y;
    }
  }

  const xRange = xMax - xMin;
  const yRange = yMax - yMin;
  const margin = bounds * 0.05; // 5% padding
  const usable = bounds - 2 * margin;

  for (let i = 0; i < positions.length; i += 2) {
    // X axis
    if (xRange > 1e-10) {
      positions[i] = margin + ((positions[i] - xMin) / xRange) * usable;
    } else {
      positions[i] = bounds / 2; // Center constant-valued axis
    }
    // Y axis
    if (yRange > 1e-10) {
      positions[i + 1] = margin + ((positions[i + 1] - yMin) / yRange) * usable;
    } else {
      positions[i + 1] = bounds / 2;
    }
  }
}
