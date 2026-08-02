import { describe, expect, it } from "vitest";
import { precision, recall } from "./index.js";

describe("precision", () => {
  it("computes true positives over all extracted", () => {
    expect(precision(7, 3)).toBeCloseTo(0.7);
  });

  it("returns 0 when nothing was extracted", () => {
    expect(precision(0, 0)).toBe(0);
  });
});

describe("recall", () => {
  it("computes true positives over all real items", () => {
    expect(recall(7, 3)).toBeCloseTo(0.7);
  });
});
