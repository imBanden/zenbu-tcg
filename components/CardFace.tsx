import type { Card, CardSetMeta } from "@/lib/cards/types";
import { holoMeta } from "@/lib/cards/rarity";

/**
 * The visual face of a card. Renders real art when `card.image` is set,
 * otherwise a styled, accurate placeholder. Pure presentational.
 */
export default function CardFace({ card, set }: { card: Card; set: CardSetMeta }) {
  const meta = holoMeta(card.holoTier);
  const num = String(card.number).padStart(3, "0");

  if (card.image) {
    return (
      // Hotlinked from an external CDN (TCGdex); next/image optimization is off
      // anyway, and a plain <img> avoids remote-domain config. Lazy by default.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={card.image}
        alt={`${card.name} — ${set.wordmark} ${num}`}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col justify-between bg-linear-to-b from-[#15151d] to-[#0b0b11] p-[6%] text-left">
      {/* rarity hairline at the very top */}
      <span
        aria-hidden
        className={`absolute inset-x-0 top-0 h-0.75 ${
          card.secret ? "bg-linear-to-r from-transparent via-gold/70 to-transparent" : "bg-white/5"
        }`}
      />

      {/* big ghosted number watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[5.5rem] font-bold leading-none text-white/4.5"
      >
        {num}
      </span>

      {/* header */}
      <div className="relative flex items-center justify-between gap-2">
        <span className="truncate text-[0.58rem] font-semibold tracking-[0.18em] text-white/45">
          {set.wordmark}
        </span>
        {card.badge ? (
          <span
            className={`shrink-0 rounded border px-1.5 py-px font-mono text-[0.58rem] font-semibold leading-none ${meta.chip}`}
          >
            {card.badge}
          </span>
        ) : null}
      </div>

      {/* footer info */}
      <div className="relative">
        <p className="truncate text-[0.95rem] font-semibold leading-tight text-white">
          {card.name}
        </p>
        <p className="mt-0.5 truncate text-[0.62rem] text-white/55">{card.label}</p>
        <div className="mt-1.5 flex items-center justify-between font-mono text-[0.56rem] text-white/55">
          <span>
            {num} / {set.total}
          </span>
          <span>{set.footer}</span>
        </div>
      </div>
    </div>
  );
}
