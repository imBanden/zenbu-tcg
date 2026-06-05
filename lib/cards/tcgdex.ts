import type { Card } from "./types";

/** Per-set TCGdex lookup config. */
export type TcgdexConfig = { id: string; lang: string };

type TcgdexCard = { localId?: string; image?: string | null };
type TcgdexSet = { cards?: TcgdexCard[] };

const QUALITY = "high";
const EXT = "webp";

/**
 * Build-time only: enrich a set's cards with hotlinked TCGdex image URLs.
 *
 * One fetch per set. We store nothing — the returned `image` points straight at
 * TCGdex's open CDN (assets.tcgdex.net/.../{localId}/high.webp). Any failure
 * (set not on TCGdex yet, network error, no images) returns the cards unchanged
 * so the binder falls back to its styled placeholders.
 */
export async function enrichWithTcgdex(
  cards: Card[],
  cfg?: TcgdexConfig,
): Promise<Card[]> {
  if (!cfg) return cards;
  try {
    const res = await fetch(
      `https://api.tcgdex.net/v2/${cfg.lang}/sets/${cfg.id}`,
    );
    if (!res.ok) return cards;

    const data = (await res.json()) as TcgdexSet;
    const byNumber = new Map<number, string>();
    for (const c of data.cards ?? []) {
      if (!c.image || !c.localId) continue;
      const n = Number.parseInt(c.localId, 10);
      if (Number.isNaN(n)) continue;
      byNumber.set(n, `${c.image}/${QUALITY}.${EXT}`);
    }
    if (byNumber.size === 0) return cards;

    return cards.map((card) => {
      const image = byNumber.get(card.number);
      return image ? { ...card, image } : card;
    });
  } catch {
    return cards;
  }
}
