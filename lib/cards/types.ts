/** A single card in a set's binder. Set-agnostic: the holo tier (not a fixed
 * rarity code) drives the shine, so sets with coarse PDF data map honestly. */
export type Card = {
  /** Sequential master-set number. */
  number: number;
  /** Card name, e.g. "Mega Darkrai ex". */
  name: string;
  /** Short badge shown top-right (rarity code or category tag). Empty = hidden. */
  badge: string;
  /** Descriptor under the name, e.g. "Pokémon ex · Double Rare" or "Mega ex · Secret Rare". */
  label: string;
  /** Holographic intensity tier 0–5 (drives the TiltCard shine). */
  holoTier: number;
  /** Secret card (numbered beyond the base set). */
  secret: boolean;
  /** Optional real art path; absent → styled placeholder. */
  image?: string;
};

/** Per-set display chrome shown on each placeholder face. */
export type CardSetMeta = {
  /** Wordmark in the card header, e.g. "ABYSS EYE". */
  wordmark: string;
  /** Footer tag, e.g. "M5 · 2026". */
  footer: string;
  /** Total cards in the set (for "NNN / total"). */
  total: number;
};
