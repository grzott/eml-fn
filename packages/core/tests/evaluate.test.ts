import { describe, expect, it } from "vitest";
import { evaluate, safeEvaluate } from "../src/evaluate.js";
import { fromRPN } from "../src/serialize.js";

describe("evaluate", () => {
  it("evaluate 11E ≈ e", () => {
    const tree = fromRPN("11E");
    expect(evaluate(tree, {})).toBeCloseTo(Math.E, 14);
  });

  it("evaluate x1E with x=2 ≈ exp(2)", () => {
    const tree = fromRPN("x1E");
    expect(evaluate(tree, { x: 2 })).toBeCloseTo(Math.exp(2), 14);
  });

  it("evaluate 11xE1EE with x=2 ≈ ln(2)", () => {
    const tree = fromRPN("11xE1EE");
    expect(evaluate(tree, { x: 2 })).toBeCloseTo(Math.log(2), 13);
  });

  it("evaluate 111E1EE ≈ 0", () => {
    const tree = fromRPN("111E1EE");
    expect(evaluate(tree, {})).toBeCloseTo(0, 13);
  });

  it("evaluate 11x1EE1EE with x=3.7 ≈ 3.7 (identity)", () => {
    const tree = fromRPN("11x1EE1EE");
    expect(evaluate(tree, { x: 3.7 })).toBeCloseTo(3.7, 13);
  });

  it("throws on unbound variable", () => {
    const tree = fromRPN("x1E");
    expect(() => evaluate(tree, {})).toThrow(RangeError);
    expect(() => evaluate(tree, {})).toThrow("Unbound variable: 'x'");
  });
});

describe("safeEvaluate", () => {
  it("safeEvaluate 11E ≈ e", () => {
    const tree = fromRPN("11E");
    expect(safeEvaluate(tree, {})).toBeCloseTo(Math.E, 14);
  });

  it("never returns NaN for well-formed trees", () => {
    const tree = fromRPN("11E");
    expect(Number.isNaN(safeEvaluate(tree, {}))).toBe(false);
  });

  it("throws on unbound variable", () => {
    const tree = fromRPN("x1E");
    expect(() => safeEvaluate(tree, {})).toThrow(RangeError);
  });
});
