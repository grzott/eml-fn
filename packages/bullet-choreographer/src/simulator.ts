import { evaluate, safeEvaluate } from '@eml-fn/core';
import type { PatternPair, SimulateOpts, TrajectoryData } from './types.js';

const TAU = 2 * Math.PI;

/**
 * Simulate bullet trajectories for a pattern pair.
 * Position is direct tree output — no velocity/acceleration integration.
 *
 * By default uses safeEvaluate (clamped exp/ln) so bullets stay bounded.
 * Pass { safe: false } to use raw evaluate (original behavior).
 *
 * Variables available to trees: t (time), i (bullet index), n (bullet count), tau (2π).
 *
 * Output: Float32Array[bullets × steps × 2] with x,y interleaved.
 * Index: data[(step * bulletCount + bulletIdx) * 2 + 0] = x, +1 = y
 *
 * On first NaN/Infinity for a bullet, marks it dead and fills remaining steps
 * with the last valid position.
 */
export function simulate(
  pair: PatternPair,
  bulletCount: number,
  timeSteps: number,
  dt: number,
  opts?: SimulateOpts,
): TrajectoryData {
  const positions = new Float32Array(bulletCount * timeSteps * 2);
  const alive: boolean[] = new Array(bulletCount).fill(true);
  const lastValidX = new Float32Array(bulletCount);
  const lastValidY = new Float32Array(bulletCount);

  const useSafe = opts?.safe !== false;
  const safeOpts = useSafe ? { maxExp: opts?.maxExp ?? 10 } : undefined;

  for (let step = 0; step < timeSteps; step++) {
    const t = step * dt;

    for (let b = 0; b < bulletCount; b++) {
      const idx = (step * bulletCount + b) * 2;

      if (!alive[b]) {
        positions[idx] = lastValidX[b];
        positions[idx + 1] = lastValidY[b];
        continue;
      }

      const vars = { t, i: b, n: bulletCount, tau: TAU };
      const x = useSafe ? safeEvaluate(pair.xTree, vars, safeOpts) : evaluate(pair.xTree, vars);
      const y = useSafe ? safeEvaluate(pair.yTree, vars, safeOpts) : evaluate(pair.yTree, vars);

      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        alive[b] = false;
        positions[idx] = lastValidX[b];
        positions[idx + 1] = lastValidY[b];
      } else {
        positions[idx] = x;
        positions[idx + 1] = y;
        lastValidX[b] = x;
        lastValidY[b] = y;
      }
    }
  }

  return { positions, bulletCount, timeSteps, dt, alive };
}
