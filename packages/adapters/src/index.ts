export type { Message } from "./message.js";

export function hasReachablePermalink(message: { permalink: string }): boolean {
  return message.permalink.trim().length > 0;
}
