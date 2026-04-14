import { describe, expect, it } from "vitest";
import { nodeCount } from "../src/analysis.js";
import { equals } from "../src/analysis.js";
import {
  countTrees,
  enumerate,
  enumerateByNodeCount,
} from "../src/enumerate.js";

describe("enumerateByNodeCount", () => {
  it("n=0, leafTypes=[1] yields 1 tree", () => {
    const trees = [...enumerateByNodeCount(0, ["1"])];
    expect(trees).toHaveLength(1);
    expect(trees[0]).toEqual({ type: "const", value: 1 });
  });

  it("n=1, leafTypes=[1] yields 1 tree", () => {
    const trees = [...enumerateByNodeCount(1, ["1"])];
    expect(trees).toHaveLength(1);
  });

  it("n=1, leafTypes=[1,x] yields 4 trees", () => {
    const trees = [...enumerateByNodeCount(1, ["1", "x"])];
    expect(trees).toHaveLength(4);
  });

  it("countTrees matches actual enumeration for n=2, leafTypes=3", () => {
    const actual = [...enumerateByNodeCount(2, ["1", "u", "v"])].length;
    const expected = countTrees(2, 3);
    expect(actual).toBe(expected);
  });

  it("all enumerated trees at n=2 have exactly 2 eml nodes", () => {
    const trees = [...enumerateByNodeCount(2, ["1", "x"])];
    for (const tree of trees) {
      expect(nodeCount(tree)).toBe(2);
    }
  });

  it("no duplicates in enumeration", () => {
    const trees = [...enumerateByNodeCount(2, ["1", "x"])];
    for (let i = 0; i < trees.length; i++) {
      for (let j = i + 1; j < trees.length; j++) {
        expect(equals(trees[i], trees[j])).toBe(false);
      }
    }
  });
});

describe("countTrees", () => {
  it("countTrees(0, 1) = 1", () => {
    expect(countTrees(0, 1)).toBe(1);
  });

  it("countTrees(1, 2) = 4", () => {
    expect(countTrees(1, 2)).toBe(4);
  });

  it("countTrees(2, 3) = 2 * 27 = 54", () => {
    // Catalan(2) = 2, leafTypes^3 = 27
    expect(countTrees(2, 3)).toBe(54);
  });
});

describe("enumerate (by depth)", () => {
  it("depth=0 yields only leaves", () => {
    const trees = [...enumerate(0, ["1", "x"])];
    expect(trees).toHaveLength(2);
  });

  it("depth=1 yields leaves + depth-1 trees", () => {
    const trees = [...enumerate(1, ["1", "x"])];
    // depth 0: 2 leaves, depth 1: 4 trees (n=1, each with 2 leaf types)
    expect(trees).toHaveLength(6);
  });
});
