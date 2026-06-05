import type { Rarity, RarityCount } from "@/lib/sets";

const CHIP_CLASS: Record<Rarity, string> = {
  AR: "bg-rarity-ar/15 text-rarity-ar border-rarity-ar/40",
  SR: "bg-rarity-sr/15 text-rarity-sr border-rarity-sr/40",
  SAR: "bg-rarity-sar/15 text-rarity-sar border-rarity-sar/40",
  // MUR: near-black fill with a gold border (per the PDFs).
  MUR: "bg-rarity-mur text-gold border-gold",
  // MA: Mega Attack Rare (M2a high-class pack).
  MA: "bg-gold/15 text-gold border-gold/60",
};

export default function RarityChips({
  rarities,
}: {
  rarities?: RarityCount[];
}) {
  if (!rarities?.length) return null;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {rarities.map(({ rarity, count }) => (
        <li
          key={rarity}
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${CHIP_CLASS[rarity]}`}
        >
          {count} {rarity}
        </li>
      ))}
    </ul>
  );
}
