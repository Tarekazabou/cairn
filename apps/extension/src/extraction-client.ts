import type { Message } from "@cairn/adapters";
import type { ExtractedItem } from "@cairn/core";

const DEFAULT_URL = "http://localhost:8080";

// Measured against the real running service (ADR-0001 addendum): the free
// OpenRouter model took ~53s for a 5-message batch, already past
// problem-statement.md §4's 30s guardrail on its own. 60s here is a "fail
// with a clear message" backstop, not a target — the actual fix is a faster
// model/provider, not a longer timeout.
const TIMEOUT_MS = 60_000;

/**
 * Calls the real services/extraction /extract endpoint (ADR-0001). No retry
 * here — the service itself already retries once on schema mismatch
 * (llm.rs); a network-level failure just surfaces as a rejected promise for
 * the caller to show the user, per M2's "manual button" trigger (ADR-0002) —
 * there's always a human present to try again, unlike a background job.
 */
export async function callExtractionService(
  messages: Message[],
  baseUrl: string = import.meta.env.VITE_EXTRACTION_SERVICE_URL ?? DEFAULT_URL,
): Promise<ExtractedItem[]> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new Error(`extraction timed out after ${TIMEOUT_MS / 1000}s`, {
        cause: error,
      });
    }
    throw error;
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `extraction service returned ${response.status}: ${detail}`,
    );
  }

  const data = (await response.json()) as { items: ExtractedItem[] };
  return data.items;
}
