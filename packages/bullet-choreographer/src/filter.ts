import { simulate } from './simulator.js';
import type { FilterOpts, PatternPair, SimulateOpts, TrajectoryData } from './types.js';

const DEFAULTS: Required<Omit<FilterOpts, 'simulate'>> & {
  simulate: SimulateOpts;
} = {
  bulletCount: 50,
  timeSteps: 200,
  dt: 0.016,
  bounds: 1000,
  staticVariance: 1e-6,
  identicalDistance: 1e-4,
  boringVariance: 1.0,
  oobSteps: 5,
  simulate: { safe: true, maxExp: 10 },
};

/**
 * Filter degenerate patterns from an iterable of PatternPairs.
 * Pipeline: simulate → NaN check → static check → OOB check → identical check → boring check → saturated check.
 * Returns generator of surviving pairs with attached TrajectoryData.
 */
export function* filterDegenerate(
  pairs: Iterable<PatternPair>,
  opts?: FilterOpts,
): Generator<{ pair: PatternPair; trajectory: TrajectoryData }> {
  const o = { ...DEFAULTS, ...opts };
  const simOpts: SimulateOpts = { ...DEFAULTS.simulate, ...opts?.simulate };
  const maxVal = simOpts.safe !== false ? Math.exp(simOpts.maxExp ?? 10) : 0;

  for (const pair of pairs) {
    const traj = simulate(pair, o.bulletCount, o.timeSteps, o.dt, simOpts);

    if (isNaNAtStart(traj)) continue;
    if (isStatic(traj, o.staticVariance)) continue;
    if (isOOB(traj, o.bounds, o.oobSteps)) continue;
    if (isIdentical(traj, o.identicalDistance)) continue;
    if (isBoring(traj, o.boringVariance)) continue;
    if (simOpts.safe !== false && isSaturated(traj, maxVal)) continue;

    yield { pair, trajectory: traj };
  }
}

/** Reject if any bullet has NaN/Infinity at t=0 */
function isNaNAtStart(traj: TrajectoryData): boolean {
  for (let b = 0; b < traj.bulletCount; b++) {
    const idx = b * 2; // step 0
    const x = traj.positions[idx];
    const y = traj.positions[idx + 1];
    if (!Number.isFinite(x) || !Number.isFinite(y)) return true;
  }
  return false;
}

/** Reject if all bullets are at the same position (variance < threshold) */
function isStatic(traj: TrajectoryData, threshold: number): boolean {
  let sumX = 0;
  let sumY = 0;
  let sumX2 = 0;
  let sumY2 = 0;
  let count = 0;

  for (let step = 0; step < traj.timeSteps; step++) {
    for (let b = 0; b < traj.bulletCount; b++) {
      const idx = (step * traj.bulletCount + b) * 2;
      const x = traj.positions[idx];
      const y = traj.positions[idx + 1];
      sumX += x;
      sumY += y;
      sumX2 += x * x;
      sumY2 += y * y;
      count++;
    }
  }

  const varX = sumX2 / count - (sumX / count) ** 2;
  const varY = sumY2 / count - (sumY / count) ** 2;
  return varX + varY < threshold;
}

/** Reject if all bullets exit bounds within first oobSteps steps */
function isOOB(traj: TrajectoryData, bounds: number, oobSteps: number): boolean {
  const stepsToCheck = Math.min(oobSteps, traj.timeSteps);

  for (let step = 0; step < stepsToCheck; step++) {
    let allOutside = true;
    for (let b = 0; b < traj.bulletCount; b++) {
      const idx = (step * traj.bulletCount + b) * 2;
      const x = Math.abs(traj.positions[idx]);
      const y = Math.abs(traj.positions[idx + 1]);
      if (x <= bounds && y <= bounds) {
        allOutside = false;
        break;
      }
    }
    if (!allOutside) return false;
  }

  return true;
}

/** Reject if all trajectories are identical (pairwise distance < threshold) */
function isIdentical(traj: TrajectoryData, threshold: number): boolean {
  if (traj.bulletCount < 2) return false;

  // Compare all pairs — early exit on first divergent pair
  for (let a = 0; a < traj.bulletCount - 1; a++) {
    for (let b = a + 1; b < traj.bulletCount; b++) {
      let maxDist = 0;
      for (let step = 0; step < traj.timeSteps; step++) {
        const idxA = (step * traj.bulletCount + a) * 2;
        const idxB = (step * traj.bulletCount + b) * 2;
        const dx = traj.positions[idxA] - traj.positions[idxB];
        const dy = traj.positions[idxA + 1] - traj.positions[idxB + 1];
        maxDist = Math.max(maxDist, Math.sqrt(dx * dx + dy * dy));
        if (maxDist >= threshold) return false;
      }
    }
  }

  return true;
}

/** Reject if total position variance is below threshold (boring) */
function isBoring(traj: TrajectoryData, threshold: number): boolean {
  // Same as isStatic but with different default threshold
  let sumX = 0;
  let sumY = 0;
  let sumX2 = 0;
  let sumY2 = 0;
  let count = 0;

  for (let step = 0; step < traj.timeSteps; step++) {
    for (let b = 0; b < traj.bulletCount; b++) {
      const idx = (step * traj.bulletCount + b) * 2;
      const x = traj.positions[idx];
      const y = traj.positions[idx + 1];
      sumX += x;
      sumY += y;
      sumX2 += x * x;
      sumY2 += y * y;
      count++;
    }
  }

  const varX = sumX2 / count - (sumX / count) ** 2;
  const varY = sumY2 / count - (sumY / count) ** 2;
  return varX + varY < threshold;
}

/** Reject if >60% of positions are pinned at saturation limit (clamp ceiling) */
function isSaturated(traj: TrajectoryData, maxVal: number): boolean {
  if (maxVal <= 0) return false;
  const threshold = maxVal * 0.9;
  let saturatedCount = 0;
  const total = traj.positions.length;
  for (let i = 0; i < total; i++) {
    if (Math.abs(traj.positions[i]) > threshold) saturatedCount++;
  }
  return saturatedCount / total > 0.6;
}
