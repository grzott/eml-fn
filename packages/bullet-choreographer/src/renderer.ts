import { normalizeAdaptive, normalizers } from "./normalizer.js";
import { simulate } from "./simulator.js";
import type { PatternPair, RenderOpts } from "./types.js";

/**
 * Simulate a pattern pair and render bullet trails to a 2D canvas.
 * Requires a DOM canvas element — use test.skip in Node/Bun tests.
 */
export function simulateToCanvas(
  pair: PatternPair,
  canvas: HTMLCanvasElement,
  opts?: RenderOpts,
): void {
  const bulletCount = opts?.bulletCount ?? 50;
  const timeSteps = opts?.timeSteps ?? 200;
  const dt = opts?.dt ?? 0.016;
  const color = opts?.color ?? "rgba(0, 255, 128, 0.6)";
  const backgroundColor = opts?.backgroundColor ?? "#000";
  const normType = opts?.normalizer ?? "modular";
  const bounds = opts?.bounds ?? Math.min(canvas.width, canvas.height);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const traj = simulate(pair, bulletCount, timeSteps, dt, {
    safe: true,
    maxExp: 10,
  });

  // Apply normalizer
  if (normType === "adaptive") {
    normalizeAdaptive(traj.positions, bounds);
  } else {
    const norm = normalizers[normType];
    for (let i = 0; i < traj.positions.length; i++) {
      traj.positions[i] = norm(traj.positions[i], bounds);
    }
  }

  // Clear canvas
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw trails
  ctx.fillStyle = color;
  const dotSize = 2;

  for (let step = 0; step < timeSteps; step++) {
    const alpha = (step + 1) / timeSteps;
    ctx.globalAlpha = alpha;

    for (let b = 0; b < bulletCount; b++) {
      const idx = (step * bulletCount + b) * 2;
      const x = traj.positions[idx];
      const y = traj.positions[idx + 1];
      ctx.fillRect(x - dotSize / 2, y - dotSize / 2, dotSize, dotSize);
    }
  }

  ctx.globalAlpha = 1;
}
