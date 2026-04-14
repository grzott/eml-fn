import { constNode, emlNode, varNode } from "@eml-fn/core";
import { describe, expect, it } from "vitest";
import { simulate } from "../src/simulator.js";
import type { PatternPair } from "../src/types.js";

describe("simulate", () => {
  it("returns Float32Array with correct dimensions", () => {
    const pair: PatternPair = {
      xTree: varNode("t"),
      yTree: varNode("i"),
    };
    const traj = simulate(pair, 10, 50, 0.016);

    expect(traj.positions).toBeInstanceOf(Float32Array);
    expect(traj.positions.length).toBe(10 * 50 * 2);
    expect(traj.bulletCount).toBe(10);
    expect(traj.timeSteps).toBe(50);
    expect(traj.dt).toBe(0.016);
  });

  it("position is direct tree output (no physics integration)", () => {
    // xTree = t, yTree = i → x should be time, y should be bullet index
    const pair: PatternPair = {
      xTree: varNode("t"),
      yTree: varNode("i"),
    };
    const traj = simulate(pair, 3, 5, 0.1);

    // At step 2 (t=0.2), bullet 1: x=0.2, y=1
    const step = 2;
    const bullet = 1;
    const idx = (step * 3 + bullet) * 2;
    expect(traj.positions[idx]).toBeCloseTo(0.2, 5); // x = t
    expect(traj.positions[idx + 1]).toBeCloseTo(1, 5); // y = i
  });

  it("marks bullet dead on NaN/Infinity in unsafe mode", () => {
    // eml(t, t) = exp(t) - ln(t). At t=0, ln(0) = -Infinity → result is Infinity
    const pair: PatternPair = {
      xTree: emlNode(varNode("t"), varNode("t")),
      yTree: constNode(1),
    };
    const traj = simulate(pair, 1, 5, 0.1, { safe: false });

    // Bullet 0 should be dead from step 0 (t=0 → ln(0) = -Inf)
    expect(traj.alive[0]).toBe(false);

    // All positions should be 0 (last valid = initial 0)
    for (let step = 0; step < 5; step++) {
      const idx = step * 2;
      expect(Number.isFinite(traj.positions[idx])).toBe(true);
      expect(Number.isFinite(traj.positions[idx + 1])).toBe(true);
    }
  });

  it("safe mode (default) keeps bullets alive with clamped exp/ln", () => {
    // eml(t, t) would blow up in raw mode but safeEvaluate clamps
    const pair: PatternPair = {
      xTree: emlNode(varNode("t"), varNode("t")),
      yTree: constNode(1),
    };
    const traj = simulate(pair, 1, 10, 0.1);

    // In safe mode, bullets should stay alive
    expect(traj.alive[0]).toBe(true);
    for (let step = 0; step < 10; step++) {
      const idx = step * 2;
      expect(Number.isFinite(traj.positions[idx])).toBe(true);
    }
  });

  it("provides n (bulletCount) and tau (2π) as variables", () => {
    const pair: PatternPair = {
      xTree: varNode("n"),
      yTree: varNode("tau"),
    };
    const traj = simulate(pair, 8, 3, 0.1);

    // n should be bulletCount = 8, tau should be 2π
    const idx = (0 * 8 + 0) * 2;
    expect(traj.positions[idx]).toBeCloseTo(8, 5);
    expect(traj.positions[idx + 1]).toBeCloseTo(2 * Math.PI, 5);
  });

  it("correct index layout: data[(step * bulletCount + bulletIdx) * 2]", () => {
    const pair: PatternPair = {
      xTree: constNode(5),
      yTree: constNode(3),
    };
    const traj = simulate(pair, 4, 10, 0.01);

    for (let step = 0; step < 10; step++) {
      for (let b = 0; b < 4; b++) {
        const idx = (step * 4 + b) * 2;
        expect(traj.positions[idx]).toBeCloseTo(5, 5);
        expect(traj.positions[idx + 1]).toBeCloseTo(3, 5);
      }
    }
  });

  it("bullets with valid trees stay alive", () => {
    const pair: PatternPair = {
      xTree: constNode(1),
      yTree: constNode(1),
    };
    const traj = simulate(pair, 5, 10, 0.016);

    for (let b = 0; b < 5; b++) {
      expect(traj.alive[b]).toBe(true);
    }
  });

  it("handles known EML pair: eml(1, 1) = e^1 - ln(1) = e", () => {
    const pair: PatternPair = {
      xTree: emlNode(constNode(1), constNode(1)),
      yTree: constNode(0.5),
    };
    const traj = simulate(pair, 1, 1, 0.016);

    expect(traj.positions[0]).toBeCloseTo(Math.E, 4);
    expect(traj.positions[1]).toBeCloseTo(0.5, 4);
  });
});
