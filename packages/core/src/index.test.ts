import { describe, expect, it } from "vitest";
import { isNonEmpty } from "./index.js";

describe("isNonEmpty", () => {
  it("returns false for empty or whitespace-only strings", () => {
    expect(isNonEmpty("")).toBe(false);
    expect(isNonEmpty("   ")).toBe(false);
  });

  it("returns true for strings with visible content", () => {
    expect(isNonEmpty("can you look at this before Thursday")).toBe(true);
  });
});
