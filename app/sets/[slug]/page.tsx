import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { sets } from "@/lib/sets";
import type { Card } from "@/lib/cards/types";
import { abyssEyeCards } from "@/lib/cards/abyss-eye";
import { ninjaSpinnerCards } from "@/lib/cards/ninja-spinner";
import { munikisZeroCards } from "@/lib/cards/munikis-zero";
import { megaDreamCards } from "@/lib/cards/mega-dream";
import { infernoXCards } from "@/lib/cards/inferno-x";
import { megaBraveCards } from "@/lib/cards/mega-brave";
import { megaSymphoniaCards } from "@/lib/cards/mega-symphonia";
import { enrichWithTcgdex } from "@/lib/cards/tcgdex";
import { enrichWithYuyutei } from "@/lib/cards/yuyutei";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Binder from "@/components/Binder";

/** Slug → card list. Future sets register their binder here. */
const BINDERS: Record<string, Card[]> = {
  "abyss-eye": abyssEyeCards,
  "ninja-spinner": ninjaSpinnerCards,
  "munikis-zero": munikisZeroCards,
  "mega-dream": megaDreamCards,
  "inferno-x": infernoXCards,
  "mega-brave": megaBraveCards,
  "mega-symphonia": megaSymphoniaCards,
};

// Only pre-rendered slugs exist under static export.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(BINDERS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const set = sets.find((s) => s.slug === slug);
  if (!set) return {};
  const title = `${set.name} (${set.code}) — Master Set List & Virtual Binder`;
  const description = `Browse all ${set.totalCards} cards of ${set.name} (${set.code}) in an interactive virtual binder, and download the free printable binder placeholders.`;
  return {
    title,
    description,
    alternates: { canonical: `/sets/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://zenbutcg.com/sets/${slug}`,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const set = sets.find((s) => s.slug === slug);
  const baseCards = BINDERS[slug];
  if (!set || !baseCards) notFound();
  // Build-time: hotlink real art. Prefer Yuyu-tei (has the JP Mega sets now);
  // fall back to TCGdex; else placeholders.
  const cards = set.yuyutei
    ? enrichWithYuyutei(baseCards, set.yuyutei)
    : await enrichWithTcgdex(baseCards, set.tcgdex);

  // Official Japanese key-art / logo banner for this expansion.
  const art = `https://www.pokemon-card.com/ex/${set.artCode ?? set.code.toLowerCase()}/assets/images/ogp.png`;

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
        <Link
          href="/#sets"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to sets
        </Link>

        {/* Japanese key-art / logo hero */}
        <div className="relative mx-auto mt-6 aspect-40/21 w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-black/40 ring-1 ring-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={art}
            alt={`${set.name} (${set.code}) Japanese key art`}
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-b from-transparent to-background" />
        </div>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {set.name}
              </h1>
              <span className="rounded-md border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-sm text-gold">
                {set.code}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">
              {set.totalCards} cards · {set.mainCards} main + {set.secretCards} secrets
              {set.englishEquivalent ? ` · EN ${set.englishEquivalent}` : ""}
            </p>
          </div>
          {set.pdf && (
            <a
              href={set.pdf}
              download
              className="inline-flex items-center justify-center rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-[#0a0a0f] shadow-[0_0_24px_-8px_rgba(201,162,39,0.6)] transition hover:bg-gold-strong hover:shadow-[0_0_32px_-6px_rgba(227,189,69,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]"
            >
              Download binder PDF — free
            </a>
          )}
        </div>

        <p className="mt-3 max-w-2xl text-sm text-muted">
          Flip through every card in a virtual binder. Pick a layout, then click any
          card to inspect it — move your pointer across it to tilt and catch the shine.
        </p>

        <div className="mt-10">
          <Binder cards={cards} set={set} />
        </div>
      </main>
      <Footer />
    </>
  );
}
