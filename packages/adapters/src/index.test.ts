import { describe, expect, it } from "vitest";
import { hasReachablePermalink } from "./index.js";

describe("hasReachablePermalink", () => {
  it("rejects a missing permalink", () => {
    expect(hasReachablePermalink({ permalink: "" })).toBe(false);
  });

  it("accepts a real permalink", () => {
    expect(
      hasReachablePermalink({ permalink: "https://chat.google.com/room/x/y" }),
    ).toBe(true);
  });
});
