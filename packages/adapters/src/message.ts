export type Message = {
  /** Stable, platform-native — needed for dedup and deep links. */
  id: string;
  conversationId: string;
  author: {
    id: string;
    displayName: string;
  };
  /** Plaintext; keep rich content out of v1. */
  text: string;
  timestamp: Date;
  /** Non-negotiable — trust depends on it. */
  permalink: string;
};
