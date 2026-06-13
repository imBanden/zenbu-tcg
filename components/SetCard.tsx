import Link from "next/link";
import { formatReleaseDate, type SetCardData } from "@/lib/sets";
import RarityChips from "@/components/RarityChips";

export default function SetCard({ set }: { set: SetCardData }) {
  const {
    name,
    slug,
    code,
    released,
    totalCards,
    mainCards,
    secretCards,
    rarities,
    englishEquivalent,
    pdf,
    available,
  } = set;

  // Official Japanese key-art / logo banner (consistent across expansions).
  const art = `https://www.pokemon-card.com/ex/${set.artCode ?? code.toLowerCase()}/assets/images/ogp.png`;

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card ring-1 ring-white/5 transition duration-300 ${
        available
          ? "hover:-translate-y-1 hover:border-gold/40 hover:bg-card-hover hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]"
          : "opacity-60"
      }`}
    >
      {/* Japanese key-art banner (logo baked in); English title sits below. */}
      {available && (
        <div className="relative aspect-40/21 w-full overflow-hidden bg-black/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={art}
            alt={`${name} (${code}) Japanese key art`}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-b from-transparent to-card" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        {/* Header: name + code badge */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold leading-tight text-foreground">
            {name}
          </h3>
          <span className="shrink-0 rounded-md border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-xs text-gold">
            {code}
          </span>
        </div>

        {/* Release date + English equivalent */}
        <p className="mt-1 text-sm text-muted">
          {available ? formatReleaseDate(released) : "Release date TBA"}
          {englishEquivalent ? (
            <>
              {" · EN "}
              <span className="text-foreground/70">{englishEquivalent}</span>
            </>
          ) : null}
        </p>

        {/* Count split */}
        <p className="mt-4 text-sm text-foreground/90">
          <span className="font-medium">{totalCards} cards</span>
          <span className="text-muted">
            {" · "}
            {mainCards} main + {secretCards} secrets
          </span>
        </p>

        {/* Rarity chips (renders nothing when no data) */}
        <div className="mt-3">
          <RarityChips rarities={rarities} />
        </div>

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-2 pt-5">
          {available ? (
            <>
              {pdf && (
                <a
                  href={pdf}
                  download
                  className="inline-flex w-full items-center justify-center rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-[#0a0a0f] shadow-[0_0_24px_-8px_rgba(201,162,39,0.6)] transition hover:bg-gold-strong hover:shadow-[0_0_32px_-6px_rgba(227,189,69,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]"
                >
                  Download binder PDF — free
                </a>
              )}
              <Link
                href={`/sets/${slug}`}
                className={
                  pdf
                    ? "inline-flex w-full items-center justify-center gap-1 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-gold/40 hover:text-gold"
                    : "inline-flex w-full items-center justify-center gap-1 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-[#0a0a0f] shadow-[0_0_24px_-8px_rgba(201,162,39,0.6)] transition hover:bg-gold-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]"
                }
              >
                Open virtual binder
                <span aria-hidden>→</span>
              </Link>
            </>
          ) : (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-muted"
            >
              Coming soon
            </button>
          )}
        </div>
      </div>

      {!available && (
        <span className="absolute right-4 top-4 rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
          Coming soon
        </span>
      )}
    </article>
  );
}
