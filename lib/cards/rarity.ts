/** Visual treatment per holographic tier (0 = matte → 5 = max). Shared by
 * CardFace (chip color) and TiltCard (glow). Tiers map monotonically onto the
 * Abyss Eye rarities (AR=2, SR=3, SAR=4, MUR=5) so chip colors stay on-brand. */
export type HoloMeta = { chip: string; glow: string };

const HOLO: HoloMeta[] = [
  { chip: "border-white/15 bg-white/[0.06] text-zinc-300", glow: "rgba(255,255,255,0.12)" }, // 0 matte
  { chip: "border-sky-300/40 bg-sky-300/10 text-sky-100", glow: "rgba(125,211,252,0.30)" }, // 1 subtle
  { chip: "border-rarity-ar/40 bg-rarity-ar/15 text-rarity-ar", glow: "rgba(190,24,93,0.38)" }, // 2 AR
  { chip: "border-rarity-sr/40 bg-rarity-sr/15 text-rarity-sr", glow: "rgba(124,58,237,0.42)" }, // 3 SR
  { chip: "border-rarity-sar/40 bg-rarity-sar/15 text-rarity-sar", glow: "rgba(184,134,11,0.46)" }, // 4 SAR
  { chip: "border-gold bg-gold/10 text-gold", glow: "rgba(201,162,39,0.5)" }, // 5 MUR / gold
];

export const holoMeta = (tier: number): HoloMeta =>
  HOLO[Math.min(Math.max(tier, 0), 5)];
