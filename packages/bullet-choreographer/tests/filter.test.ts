import { constNode, emlNode, varNode } from "@eml-fn/core";
import { describe, expect, it } from "vitest";
import { filterDegenerate } from "../src/filter.js";
import type { PatternPair } from "../src/types.js";

describe("filterDegenerate", () => {
  it("rejects pairs that produce NaN at t=0 (unsafe mode)", () => {
    // eml(0, 0) = exp(0) - ln(0) = 1 - (-Inf) = Inf → NaN at start
    // Must use unsafe mode since safeEvaluate clamps ln(0) to a finite value
    const nanPair: PatternPair = {
      xTree: emlNode(constNode(0), constNode(0)),
      yTree: constNode(1),
    };
    const results = [
      ...filterDegenerate([nanPair], {
        bulletCount: 5,
        timeSteps: 10,
        simulate: { safe: false },
      }),
    ];
    expect(results.length).toBe(0);
  });

  it("rejects static patterns (all bullets same position)", () => {
    // x = 1, y = 1 → all bullets at (1, 1) → static
    const staticPair: PatternPair = {
      xTree: constNode(1),
      yTree: constNode(1),
    };
    const results = [
      ...filterDegenerate([staticPair], { bulletCount: 10, timeSteps: 50 }),
    ];
    expect(results.length).toBe(0);
  });

  it("rejects identical trajectories (all bullets follow same path)", () => {
    // x = t, y = t → all bullets at (t, t) regardless of i → identical
    const identicalPair: PatternPair = {
      xTree: varNode("t"),
      yTree: varNode("t"),
    };
    const results = [
      ...filterDegenerate([identicalPair], { bulletCount: 10, timeSteps: 50 }),
    ];
    expect(results.length).toBe(0);
  });

  it("accepts patterns with varied trajectories", () => {
    // x = i, y = t → bullets spread across x based on index, move in y with time
    // This has high variance and distinct trajectories
    const goodPair: PatternPair = {
      xTree: varNode("i"),
      yTree: varNode("t"),
    };
    const results = [
      ...filterDegenerate([goodPair], {
        bulletCount: 10,
        timeSteps: 50,
        dt: 0.1,
      }),
    ];
    expect(results.length).toBe(1);
  });

  it("configurable thresholds override defaults", () => {
    // With very high boring variance threshold, even varied patterns are rejected
    const pair: PatternPair = {
      xTree: varNode("i"),
      yTree: varNode("t"),
    };
    const results = [
      ...filterDegenerate([pair], {
        bulletCount: 5,
        timeSteps: 20,
        dt: 0.01,
        boringVariance: 1e10,
      }),
    ];
    expect(results.length).toBe(0);
  });

  it("returns pair with trajectory data for accepted patterns", () => {
    const pair: PatternPair = {
      xTree: varNode("i"),
      yTree: varNode("t"),
    };
    const results = [
      ...filterDegenerate([pair], { bulletCount: 10, timeSteps: 50, dt: 0.1 }),
    ];
    expect(results[0].pair).toBe(pair);
    expect(results[0].trajectory).toBeDefined();
    expect(results[0].trajectory.positions).toBeInstanceOf(Float32Array);
  });

  it("filters multiple pairs and returns only survivors", () => {
    const goodPair: PatternPair = {
      xTree: varNode("i"),
      yTree: varNode("t"),
    };
    const staticPair: PatternPair = {
      xTree: constNode(1),
      yTree: constNode(1),
    };
    const results = [
      ...filterDegenerate([goodPair, staticPair, goodPair], {
        bulletCount: 10,
        timeSteps: 50,
        dt: 0.1,
      }),
    ];
    expect(results.length).toBe(2);
  });
});
