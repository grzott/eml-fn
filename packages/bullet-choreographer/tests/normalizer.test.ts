import { describe, expect, it } from "vitest";
import { normalizeAdaptive, normalizers } from "../src/normalizer.js";

describe("normalizers", () => {
  describe("clamp", () => {
    it("clamps values within bounds", () => {
      expect(normalizers.clamp(5, 10)).toBe(5);
      expect(normalizers.clamp(15, 10)).toBe(10);
      expect(normalizers.clamp(-15, 10)).toBe(-10);
    });

    it("handles edge values", () => {
      expect(normalizers.clamp(Number.POSITIVE_INFINITY, 100)).toBe(100);
      expect(normalizers.clamp(Number.NEGATIVE_INFINITY, 100)).toBe(-100);
      expect(Number.isNaN(normalizers.clamp(Number.NaN, 100))).toBe(true);
    });
  });

  describe("modular", () => {
    it("wraps values into [0, bounds)", () => {
      expect(normalizers.modular(5, 10)).toBe(5);
      expect(normalizers.modular(15, 10)).toBe(5);
      expect(normalizers.modular(-3, 10)).toBe(7);
    });

    it("wraps zero correctly", () => {
      expect(normalizers.modular(0, 10)).toBe(0);
      expect(normalizers.modular(10, 10)).toBe(0);
    });
  });

  describe("sigmoid", () => {
    it("maps values via tanh", () => {
      expect(normalizers.sigmoid(0, 100)).toBeCloseTo(0, 5);
      // Large positive → approaches bounds
      expect(normalizers.sigmoid(1000, 100)).toBeCloseTo(100, 1);
      // Large negative → approaches -bounds
      expect(normalizers.sigmoid(-1000, 100)).toBeCloseTo(-100, 1);
    });

    it("preserves sign", () => {
      expect(normalizers.sigmoid(5, 100)).toBeGreaterThan(0);
      expect(normalizers.sigmoid(-5, 100)).toBeLessThan(0);
    });
  });

  describe("adaptive (standalone)", () => {
    it("maps via tanh when used standalone", () => {
      expect(normalizers.adaptive(0, 100)).toBeCloseTo(0, 5);
      expect(normalizers.adaptive(1000, 100)).toBeCloseTo(100, 1);
    });
  });
});

describe("normalizeAdaptive", () => {
  it("rescales x and y axes independently with margin", () => {
    // Interleaved [x0,y0, x1,y1]: x range [0,10], y range [100,200]
    const data = new Float32Array([0, 100, 10, 200]);
    normalizeAdaptive(data, 100);
    const margin = 100 * 0.05;
    const usable = 100 - 2 * margin;
    // x: 0 → margin, 10 → margin+usable
    expect(data[0]).toBeCloseTo(margin, 1);
    expect(data[2]).toBeCloseTo(margin + usable, 1);
    // y: 100 → margin, 200 → margin+usable
    expect(data[1]).toBeCloseTo(margin, 1);
    expect(data[3]).toBeCloseTo(margin + usable, 1);
  });

  it("handles uniform data (centers constant axis)", () => {
    // All x=5, all y=5
    const data = new Float32Array([5, 5, 5, 5]);
    normalizeAdaptive(data, 100);
    // Constant axes should be centered at bounds/2
    expect(data[0]).toBeCloseTo(50, 1);
    expect(data[1]).toBeCloseTo(50, 1);
  });

  it("ignores non-finite values for min/max computation", () => {
    // x: [0, Inf], y: [10, -Inf] — finite ranges: x=[0,0]=constant, y=[10,10]=constant
    const data = new Float32Array([
      0,
      10,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ]);
    normalizeAdaptive(data, 100);
    // Both axes constant → centered
    expect(data[0]).toBeCloseTo(50, 1);
    expect(data[1]).toBeCloseTo(50, 1);
  });
});
