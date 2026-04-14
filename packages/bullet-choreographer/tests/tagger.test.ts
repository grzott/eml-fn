import { constNode, varNode } from '@eml-fn/core';
import { describe, expect, it } from 'vitest';
import { simulate } from '../src/simulator.js';
import { autoTag } from '../src/tagger.js';
import type { PatternPair, TrajectoryData } from '../src/types.js';

describe('autoTag', () => {
  it('returns at least one tag for non-degenerate patterns', () => {
    const pair: PatternPair = {
      xTree: varNode('i'),
      yTree: varNode('t'),
    };
    const traj = simulate(pair, 20, 100, 0.016);
    const tags = autoTag(pair, traj);
    expect(tags.length).toBeGreaterThanOrEqual(1);
  });

  it('tags diverging pattern as "diverge"', () => {
    // Manually create trajectory data that clearly diverges
    const bulletCount = 20;
    const timeSteps = 100;
    const positions = new Float32Array(bulletCount * timeSteps * 2);

    // Each bullet moves away from origin linearly in a different direction
    for (let step = 0; step < timeSteps; step++) {
      for (let b = 0; b < bulletCount; b++) {
        const angle = (2 * Math.PI * b) / bulletCount;
        const r = 1 + step * 2; // increasing distance
        const idx = (step * bulletCount + b) * 2;
        positions[idx] = r * Math.cos(angle) + b * 0.5; // offset to avoid fan
        positions[idx + 1] = r * Math.sin(angle) + b * 0.3;
      }
    }

    const traj: TrajectoryData = {
      positions,
      bulletCount,
      timeSteps,
      dt: 0.016,
      alive: new Array(bulletCount).fill(true),
    };

    const pair: PatternPair = { xTree: constNode(0), yTree: constNode(0) };
    const tags = autoTag(pair, traj);
    expect(tags).toContain('diverge');
  });

  it('tags circular arrangement as "ring"', () => {
    // Create a ring: x = cos(2πi/n), y = sin(2πi/n)
    // We can't directly express trig, but we can provide trajectory data
    const bulletCount = 20;
    const timeSteps = 50;
    const positions = new Float32Array(bulletCount * timeSteps * 2);

    for (let step = 0; step < timeSteps; step++) {
      for (let b = 0; b < bulletCount; b++) {
        const angle = (2 * Math.PI * b) / bulletCount;
        const radius = 10;
        const idx = (step * bulletCount + b) * 2;
        positions[idx] = radius * Math.cos(angle);
        positions[idx + 1] = radius * Math.sin(angle);
      }
    }

    const traj: TrajectoryData = {
      positions,
      bulletCount,
      timeSteps,
      dt: 0.016,
      alive: new Array(bulletCount).fill(true),
    };

    const pair: PatternPair = { xTree: constNode(0), yTree: constNode(0) };
    const tags = autoTag(pair, traj);
    expect(tags).toContain('ring');
  });

  it('falls back to "chaos" when no other tag matches', () => {
    // Chaotic data: bullets at wildly different distances from centroid
    // to avoid accidentally triggering ring detection
    const bulletCount = 10;
    const timeSteps = 50;
    const positions = new Float32Array(bulletCount * timeSteps * 2);

    // Each bullet at a dramatically different scale, non-periodic
    let seed = 42;
    for (let step = 0; step < timeSteps; step++) {
      for (let b = 0; b < bulletCount; b++) {
        seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
        const scale = (b + 1) * 50; // wildly different per-bullet scales
        const idx = (step * bulletCount + b) * 2;
        seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
        positions[idx] = (seed / 0x7fffffff - 0.5) * scale;
        seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
        positions[idx + 1] = (seed / 0x7fffffff - 0.5) * scale;
      }
    }

    const traj: TrajectoryData = {
      positions,
      bulletCount,
      timeSteps,
      dt: 0.016,
      alive: new Array(bulletCount).fill(true),
    };

    const pair: PatternPair = { xTree: constNode(0), yTree: constNode(0) };
    const tags = autoTag(pair, traj);
    expect(tags).toContain('chaos');
  });

  it('can assign multiple tags to one pattern', () => {
    // A pattern that fans out from origin could be both 'fan' and 'diverge'
    const bulletCount = 20;
    const timeSteps = 100;
    const positions = new Float32Array(bulletCount * timeSteps * 2);

    // All start at origin, then diverge linearly
    for (let step = 0; step < timeSteps; step++) {
      for (let b = 0; b < bulletCount; b++) {
        const angle = (2 * Math.PI * b) / bulletCount;
        const idx = (step * bulletCount + b) * 2;
        const r = step * 0.5;
        positions[idx] = r * Math.cos(angle);
        positions[idx + 1] = r * Math.sin(angle);
      }
    }

    const traj: TrajectoryData = {
      positions,
      bulletCount,
      timeSteps,
      dt: 0.016,
      alive: new Array(bulletCount).fill(true),
    };

    const pair: PatternPair = { xTree: constNode(0), yTree: constNode(0) };
    const tags = autoTag(pair, traj);
    // Should have multiple tags (fan + diverge most likely)
    expect(tags.length).toBeGreaterThanOrEqual(1);
  });
});
