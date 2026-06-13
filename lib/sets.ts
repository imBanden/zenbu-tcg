/** Secret rarity codes shown as chips on the home set card. */
export type Rarity = "AR" | "SR" | "SAR" | "MUR" | "MA";

/** A single rarity bucket within a set's "secrets" count. */
export type RarityCount = {
  rarity: Rarity;
  count: number;
};

export type SetCardData = {
  /** Japanese set name, e.g. "Abyss Eye". */
  name: string;
  /** URL slug for the set's page, e.g. "abyss-eye". */
  slug: string;
  /** Official set code shown as a badge, e.g. "M5". */
  code: string;
  /** ISO date (YYYY-MM-DD) of the Japanese release. */
  released: string;
  /** Total cards in the master set. */
  totalCards: number;
  /** Number of "main" (non-secret) cards. */
  mainCards: number;
  /** Number of "secret" cards (AR/SR/SAR/MUR etc.). */
  secretCards: number;
  /** Optional per-rarity breakdown of the secrets. */
  rarities?: RarityCount[];
  /** English-equivalent set name, for context/SEO. */
  englishEquivalent?: string;
  /** Public path to the printable binder-insert PDF (optional — not every set has one). */
  pdf?: string;
  /** When false, render a dimmed "Coming soon" card with a disabled button. */
  available: boolean;
  /** TCGdex set id + language for build-time card-image enrichment (optional). */
  tcgdex?: { id: string; lang: string };
  /** Yuyu-tei set code (e.g. "m05") for hotlinked card images (preferred when set). */
  yuyutei?: { code: string };
  /** Override for the official key-art banner code when it differs from `code`
   *  (e.g. M1L/M1S share pokemon-card.com/ex/m1/). Defaults to code.toLowerCase(). */
  artCode?: string;
};

/**
 * The master set list. Seeded with Abyss Eye (M5) as the canonical, copy-ready
 * standard — future sets follow the same shape. A "Coming soon" set is simply
 * `available: false` (the type + <SetCard> already handle that state).
 */
export const sets: SetCardData[] = [
  {
    name: "Abyss Eye",
    slug: "abyss-eye",
    code: "M5",
    released: "2026-05-22",
    totalCards: 118,
    mainCards: 81,
    secretCards: 37,
    rarities: [
      { rarity: "AR", count: 12 },
      { rarity: "SR", count: 18 },
      { rarity: "SAR", count: 6 },
      { rarity: "MUR", count: 1 },
    ],
    englishEquivalent: "Pitch Black",
    // Images baked from tcgcollector (clean/watermark-free) in lib/cards/abyss-eye.ts.
    pdf: "/pdfs/Abyss_Eye_binder_inserts.pdf",
    available: true,
  },
  {
    name: "Ninja Spinner",
    slug: "ninja-spinner",
    code: "M4",
    released: "2026-03-13",
    totalCards: 120,
    mainCards: 83,
    secretCards: 37,
    rarities: [
      { rarity: "AR", count: 12 },
      { rarity: "SR", count: 18 },
      { rarity: "SAR", count: 6 },
      { rarity: "MUR", count: 1 },
    ],
    pdf: "/pdfs/Ninja_Spinner_binder_inserts.pdf",
    available: true,
  },
  {
    name: "Munikis Zero",
    slug: "munikis-zero",
    code: "M3",
    released: "2026-01-23",
    totalCards: 117,
    mainCards: 80,
    secretCards: 37,
    rarities: [
      { rarity: "AR", count: 12 },
      { rarity: "SR", count: 18 },
      { rarity: "SAR", count: 6 },
      { rarity: "MUR", count: 1 },
    ],
    available: true,
  },
  {
    name: "Mega Dream ex",
    slug: "mega-dream",
    code: "M2a",
    released: "2025-11-28",
    totalCards: 250,
    mainCards: 193,
    secretCards: 57,
    rarities: [
      { rarity: "AR", count: 20 },
      { rarity: "SR", count: 9 },
      { rarity: "SAR", count: 17 },
      { rarity: "MA", count: 10 },
      { rarity: "MUR", count: 1 },
    ],
    available: true,
  },
  {
    name: "Inferno X",
    slug: "inferno-x",
    code: "M2",
    released: "2025-09-26",
    totalCards: 116,
    mainCards: 80,
    secretCards: 36,
    rarities: [
      { rarity: "AR", count: 12 },
      { rarity: "SR", count: 17 },
      { rarity: "SAR", count: 6 },
      { rarity: "MUR", count: 1 },
    ],
    available: true,
  },
  {
    name: "Mega Brave",
    slug: "mega-brave",
    code: "M1L",
    released: "2025-08-01",
    totalCards: 92,
    mainCards: 63,
    secretCards: 29,
    rarities: [
      { rarity: "AR", count: 12 },
      { rarity: "SR", count: 11 },
      { rarity: "SAR", count: 5 },
      { rarity: "MUR", count: 1 },
    ],
    artCode: "m1",
    available: true,
  },
  {
    name: "Mega Symphonia",
    slug: "mega-symphonia",
    code: "M1S",
    released: "2025-08-01",
    totalCards: 92,
    mainCards: 63,
    secretCards: 29,
    rarities: [
      { rarity: "AR", count: 12 },
      { rarity: "SR", count: 11 },
      { rarity: "SAR", count: 5 },
      { rarity: "MUR", count: 1 },
    ],
    artCode: "m1",
    available: true,
  },
];

/** Format an ISO date deterministically (UTC) for reproducible builds. */
export function formatReleaseDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
