import type { PatternPair, TagName, TrajectoryData } from './types.js';

/**
 * Auto-tag a pattern pair based on its trajectory data.
 * Returns at least one tag for every pattern.
 * A pattern can have multiple tags (e.g., ['spiral', 'diverge']).
 */
export function autoTag(_pair: PatternPair, trajectory: TrajectoryData): TagName[] {
  const tags: TagName[] = [];

  if (isSpiral(trajectory)) tags.push('spiral');
  if (isFan(trajectory)) tags.push('fan');
  if (isWave(trajectory)) tags.push('wave');
  if (isRing(trajectory)) tags.push('ring');
  if (isConverge(trajectory)) tags.push('converge');
  if (isDiverge(trajectory)) tags.push('diverge');

  // Fallback: if no tag matched, it's chaos
  if (tags.length === 0) tags.push('chaos');

  return tags;
}

/** Get position at (step, bullet) */
function getPos(traj: TrajectoryData, step: number, bullet: number): [number, number] {
  const idx = (step * traj.bulletCount + bullet) * 2;
  return [traj.positions[idx], traj.positions[idx + 1]];
}

/** Compute centroid at a given step */
function centroid(traj: TrajectoryData, step: number): [number, number] {
  let cx = 0;
  let cy = 0;
  for (let b = 0; b < traj.bulletCount; b++) {
    const [x, y] = getPos(traj, step, b);
    cx += x;
    cy += y;
  }
  return [cx / traj.bulletCount, cy / traj.bulletCount];
}

/**
 * Spiral: angular velocity dθ/dt roughly constant (±30%) and r changes monotonically.
 * Convert to polar relative to centroid.
 */
function isSpiral(traj: TrajectoryData): boolean {
  if (traj.bulletCount < 2 || traj.timeSteps < 20) return false;

  // Sample a few bullets
  const sampleBullets = Math.min(5, traj.bulletCount);
  let spiralCount = 0;

  for (let b = 0; b < sampleBullets; b++) {
    const angVels: number[] = [];
    const radii: number[] = [];
    let prevAngle = 0;

    for (let step = 0; step < traj.timeSteps; step++) {
      const [cx, cy] = centroid(traj, step);
      const [x, y] = getPos(traj, step, b);
      const dx = x - cx;
      const dy = y - cy;
      const r = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      radii.push(r);
      if (step > 0) {
        let dAngle = angle - prevAngle;
        // Unwrap angle
        if (dAngle > Math.PI) dAngle -= 2 * Math.PI;
        if (dAngle < -Math.PI) dAngle += 2 * Math.PI;
        angVels.push(dAngle);
      }
      prevAngle = angle;
    }

    if (angVels.length < 10) continue;

    // Check constant angular velocity (±30%)
    const meanAV = angVels.reduce((a, v) => a + v, 0) / angVels.length;
    if (Math.abs(meanAV) < 0.01) continue; // Not rotating

    const avConsistent = angVels.every((av) => Math.abs(av - meanAV) < Math.abs(meanAV) * 0.3);

    // Check monotonic radius change
    let increasing = 0;
    let decreasing = 0;
    for (let j = 1; j < radii.length; j++) {
      if (radii[j] > radii[j - 1]) increasing++;
      else if (radii[j] < radii[j - 1]) decreasing++;
    }
    const monotonic = increasing > radii.length * 0.7 || decreasing > radii.length * 0.7;

    if (avConsistent && monotonic) spiralCount++;
  }

  return spiralCount >= Math.ceil(sampleBullets * 0.5);
}

/**
 * Fan: all bullets share a common origin at t=0 (±0.1) and diverge.
 */
function isFan(traj: TrajectoryData): boolean {
  if (traj.bulletCount < 3) return false;

  // Check common origin at t=0
  const [x0, y0] = getPos(traj, 0, 0);
  let allNearOrigin = true;
  for (let b = 1; b < traj.bulletCount; b++) {
    const [x, y] = getPos(traj, 0, b);
    if (Math.abs(x - x0) > 0.1 || Math.abs(y - y0) > 0.1) {
      allNearOrigin = false;
      break;
    }
  }
  if (!allNearOrigin) return false;

  // Check diverging: pairwise distance increases with time
  const earlyDist = meanPairwiseDistance(traj, Math.min(5, traj.timeSteps - 1));
  const lateDist = meanPairwiseDistance(traj, Math.max(0, traj.timeSteps - 5));

  return lateDist > earlyDist * 2;
}

/**
 * Wave: x or y shows periodicity — autocorrelation peak at lag > 10 steps.
 */
function isWave(traj: TrajectoryData): boolean {
  if (traj.timeSteps < 30) return false;

  // Check first bullet's x and y series for periodicity
  const sampleBullet = 0;
  const xSeries: number[] = [];
  const ySeries: number[] = [];

  for (let step = 0; step < traj.timeSteps; step++) {
    const [x, y] = getPos(traj, step, sampleBullet);
    xSeries.push(x);
    ySeries.push(y);
  }

  return hasPeriodicity(xSeries, 10) || hasPeriodicity(ySeries, 10);
}

/** Check for autocorrelation peak at lag > minLag */
function hasPeriodicity(series: number[], minLag: number): boolean {
  const n = series.length;
  const mean = series.reduce((a, v) => a + v, 0) / n;
  const variance = series.reduce((a, v) => a + (v - mean) ** 2, 0) / n;
  if (variance < 1e-10) return false;

  const maxLag = Math.floor(n / 2);

  for (let lag = minLag; lag < maxLag; lag++) {
    let sum = 0;
    for (let j = 0; j < n - lag; j++) {
      sum += (series[j] - mean) * (series[j + lag] - mean);
    }
    const autocorr = sum / ((n - lag) * variance);
    if (autocorr > 0.5) return true;
  }

  return false;
}

/**
 * Ring: at some timestep, bullets form an approximate circle —
 * distance from centroid has low variance (<20% of mean radius).
 */
function isRing(traj: TrajectoryData): boolean {
  if (traj.bulletCount < 5) return false;

  // Sample every 10th step
  for (let step = 0; step < traj.timeSteps; step += Math.max(1, Math.floor(traj.timeSteps / 20))) {
    const [cx, cy] = centroid(traj, step);
    const radii: number[] = [];

    for (let b = 0; b < traj.bulletCount; b++) {
      const [x, y] = getPos(traj, step, b);
      radii.push(Math.sqrt((x - cx) ** 2 + (y - cy) ** 2));
    }

    const meanR = radii.reduce((a, v) => a + v, 0) / radii.length;
    if (meanR < 1e-6) continue;

    const variance = radii.reduce((a, v) => a + (v - meanR) ** 2, 0) / radii.length;
    const cv = Math.sqrt(variance) / meanR; // coefficient of variation

    if (cv < 0.2) return true;
  }

  return false;
}

/**
 * Converge: mean pairwise distance decreases over time.
 */
function isConverge(traj: TrajectoryData): boolean {
  if (traj.timeSteps < 10) return false;

  const earlyDist = meanPairwiseDistance(traj, Math.min(5, traj.timeSteps - 1));
  const lateDist = meanPairwiseDistance(traj, Math.max(0, traj.timeSteps - 5));

  return earlyDist > 0.01 && lateDist < earlyDist * 0.5;
}

/**
 * Diverge: mean pairwise distance increases over time.
 */
function isDiverge(traj: TrajectoryData): boolean {
  if (traj.timeSteps < 10) return false;

  const earlyDist = meanPairwiseDistance(traj, Math.min(5, traj.timeSteps - 1));
  const lateDist = meanPairwiseDistance(traj, Math.max(0, traj.timeSteps - 5));

  return lateDist > earlyDist * 2 && earlyDist > 1e-6;
}

/** Compute mean pairwise distance between bullets at a given step */
function meanPairwiseDistance(traj: TrajectoryData, step: number): number {
  if (traj.bulletCount < 2) return 0;

  let totalDist = 0;
  let pairCount = 0;

  for (let a = 0; a < traj.bulletCount - 1; a++) {
    for (let b = a + 1; b < traj.bulletCount; b++) {
      const [xa, ya] = getPos(traj, step, a);
      const [xb, yb] = getPos(traj, step, b);
      totalDist += Math.sqrt((xa - xb) ** 2 + (ya - yb) ** 2);
      pairCount++;
    }
  }

  return totalDist / pairCount;
}
