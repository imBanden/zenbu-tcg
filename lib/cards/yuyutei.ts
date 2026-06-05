import type { Card } from "./types";

/** Per-set Yuyu-tei lookup config. `code` is the shop's set code, e.g. "m05". */
export type YuyuteiConfig = { code: string };

// Largest size Yuyu-tei exposes (200×280). Image id == 10000 + card number,
// so URLs are fully derivable — no scraping/HTML parsing needed.
const BASE = "https://card.yuyu-tei.jp/poc/200_280";

/**
 * Hotlink card art from Yuyu-tei's CDN by constructing the URL per card.
 * Zero storage. No config → cards returned unchanged (placeholders).
 */
export function enrichWithYuyutei(cards: Card[], cfg?: YuyuteiConfig): Card[] {
  if (!cfg) return cards;
  return cards.map((card) => ({
    ...card,
    image: `${BASE}/${cfg.code}/${10000 + card.number}.jpg`,
  }));
}
