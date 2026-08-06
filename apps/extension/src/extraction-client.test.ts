import { afterEach, describe, expect, it, vi } from "vitest";
import { callExtractionService } from "./extraction-client.js";
import type { Message } from "@cairn/adapters";

const message: Message = {
  id: "m1",
  conversationId: "c1",
  author: { id: "u1", displayName: "alice" },
  text: "hello",
  timestamp: new Date("2026-08-06T00:00:00.000Z"),
  permalink: "https://chat.google.com/x",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("callExtractionService", () => {
  it("returns items on a successful response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            items: [{ type: "idea", text: "x", sourceMessageIds: [] }],
          }),
      }),
    );

    const items = await callExtractionService([message], "http://test");
    expect(items).toHaveLength(1);
  });

  it("throws a readable error on a non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        text: () => Promise.resolve("backend unreachable"),
      }),
    );

    await expect(
      callExtractionService([message], "http://test"),
    ).rejects.toThrow(/502.*backend unreachable/);
  });

  it("maps an AbortSignal timeout into a clear message, not a raw DOMException", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockRejectedValue(
          new DOMException("The operation was aborted", "TimeoutError"),
        ),
    );

    await expect(
      callExtractionService([message], "http://test"),
    ).rejects.toThrow(/timed out after/);
  });

  it("re-throws non-timeout fetch errors as-is", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );

    await expect(
      callExtractionService([message], "http://test"),
    ).rejects.toThrow("network down");
  });
});
