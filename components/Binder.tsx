"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Card, CardSetMeta } from "@/lib/cards/types";
import type { SetCardData } from "@/lib/sets";
import { holoMeta } from "@/lib/cards/rarity";
import TiltCard from "./TiltCard";
import CardFace from "./CardFace";
import CardInspector from "./CardInspector";
import styles from "./Binder.module.css";

type GridSize = 2 | 3 | 4;
const SIZES: GridSize[] = [2, 3, 4];
// Desktop spread is two pages wide; mobile single page is sized for big cards.
const SPREAD_MAX_WIDTH: Record<GridSize, number> = { 2: 600, 3: 880, 4: 1100 };
const SINGLE_MAX_WIDTH: Record<GridSize, number> = { 2: 360, 3: 460, 4: 560 };

export default function Binder({ cards, set }: { cards: Card[]; set: SetCardData }) {
  const [size, setSize] = useState<GridSize>(3);
  // `pos` is a SPREAD index when wide, a PAGE index when narrow.
  const [pos, setPos] = useState(0);
  const [flip, setFlip] = useState<null | "next" | "prev">(null); // desktop leaf turn
  const [dir, setDir] = useState<"next" | "prev">("next"); // mobile enter direction
  const [selected, setSelected] = useState<number | null>(null);
  const [wide, setWide] = useState(true); // ≥768px → two-page spread

  const setMeta: CardSetMeta = {
    wordmark: set.name.toUpperCase(),
    footer: `${set.code} · ${set.released.slice(0, 4)}`,
    total: set.totalCards,
  };

  const pageCards = size * size;
  const pages: Card[][] = [];
  for (let i = 0; i < cards.length; i += pageCards) pages.push(cards.slice(i, i + pageCards));
  const P = pages.length;
  const maxSpread = Math.floor(P / 2);
  const maxPos = wide ? maxSpread : Math.max(0, P - 1);
  const safePos = Math.min(pos, maxPos);
  const open = selected !== null;
  const pageAt = (idx: number): Card[] | null => (idx >= 0 && idx < P ? pages[idx] : null);

  // Detect viewport width; convert `pos` when switching between modes.
  const prevWide = useRef(wide);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (prevWide.current === wide) return;
    setPos((p) =>
      wide
        ? p === 0
          ? 0
          : Math.floor((p + 1) / 2) // page → spread
        : Math.min(2 * p, Math.max(0, P - 1)), // spread → page
    );
    setFlip(null);
    prevWide.current = wide;
  }, [wide, P]);

  // Spread page indices (desktop). Spread s → left (2s-1), right (2s); s=0 = cover + page 1.
  const leftIdx = 2 * safePos - 1;
  const rightIdx = 2 * safePos;

  const prefersReduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const go = useCallback(
    (d: "next" | "prev") => {
      const target = d === "next" ? safePos + 1 : safePos - 1;
      if (target < 0 || target > maxPos) return;
      if (wide) {
        if (flip) return;
        if (prefersReduced()) {
          setPos(target);
          return;
        }
        setFlip(d); // animate the leaf, commit on animation end
      } else {
        setDir(d);
        setPos(target); // page changes immediately + enter animation
      }
    },
    [wide, flip, safePos, maxPos],
  );

  const commitFlip = () => {
    setPos((s) => (flip === "next" ? s + 1 : flip === "prev" ? s - 1 : s));
    setFlip(null);
  };

  const changeSize = (s: GridSize) => {
    if (flip) return;
    setSize(s);
    setPos(0);
  };

  const gotoCard = useCallback(
    (idx: number) => {
      const clamped = Math.min(Math.max(idx, 0), cards.length - 1);
      setSelected(clamped);
      const p = Math.floor(clamped / pageCards);
      setPos(wide ? Math.floor((p + 1) / 2) : p);
      setFlip(null);
    },
    [cards.length, pageCards, wide],
  );

  // Arrow keys turn pages when the inspector is closed.
  useEffect(() => {
    if (open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go("next");
      else if (e.key === "ArrowLeft") go("prev");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
    gap: size === 4 ? "0.4rem" : "0.55rem",
  };

  function renderPage(pageCardsArr: Card[] | null): ReactNode {
    if (!pageCardsArr) {
      return (
        <div className={styles.cover}>
          <span className={styles.coverMark}>{setMeta.wordmark}</span>
        </div>
      );
    }
    return (
      <div className={styles.pagePanel} style={gridStyle}>
        {Array.from({ length: pageCards }).map((_, j) => {
          const card = pageCardsArr[j];
          if (!card) {
            return <div key={`e-${j}`} className={styles.pocket} style={{ aspectRatio: "5 / 7" }} />;
          }
          return (
            <TiltCard
              key={card.number}
              tier={card.holoTier}
              glow={holoMeta(card.holoTier).glow}
              maxTilt={size === 2 ? 10 : 8}
              onActivate={() => setSelected(card.number - 1)}
              ariaLabel={`Inspect ${card.name}, card ${String(card.number).padStart(3, "0")}, ${card.label}`}
            >
              <CardFace card={card} set={setMeta} />
            </TiltCard>
          );
        })}
      </div>
    );
  }

  // Desktop spread frame (rest vs. turning leaf).
  let leftPage: Card[] | null = null;
  let rightPage: Card[] | null = null;
  let leaf: { cls: string; front: Card[] | null; back: Card[] | null } | null = null;
  if (flip === "next") {
    leftPage = pageAt(leftIdx);
    rightPage = pageAt(rightIdx + 2);
    leaf = { cls: styles.leafNext, front: pageAt(rightIdx), back: pageAt(rightIdx + 1) };
  } else if (flip === "prev") {
    leftPage = pageAt(leftIdx - 2);
    rightPage = pageAt(rightIdx);
    leaf = { cls: styles.leafPrev, front: pageAt(leftIdx), back: pageAt(leftIdx - 1) };
  } else {
    leftPage = pageAt(leftIdx);
    rightPage = pageAt(rightIdx);
  }

  // Pager caption.
  const pageLabel = (() => {
    if (!wide) return `Page ${safePos + 1} of ${P}`;
    const l = leftIdx >= 0 && leftIdx < P ? leftIdx + 1 : null;
    const r = rightIdx >= 0 && rightIdx < P ? rightIdx + 1 : null;
    if (l && r) return `Pages ${l}–${r}`;
    if (r) return `Page ${r}`;
    if (l) return `Page ${l}`;
    return "";
  })();

  return (
    <div>
      <div inert={open}>
        {/* Controls */}
        <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div
            role="group"
            aria-label="Binder layout"
            className="inline-flex rounded-full border border-border bg-card p-1"
          >
            {SIZES.map((s) => {
              const active = s === size;
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={active}
                  onClick={() => changeSize(s)}
                  className={`inline-flex min-h-10 items-center rounded-full px-4 py-2 text-sm font-medium transition ${
                    active ? "bg-gold text-[#0a0a0f]" : "text-muted hover:text-foreground"
                  }`}
                >
                  {s}×{s}
                </button>
              );
            })}
          </div>
          <p className="font-mono text-xs text-muted">
            {pageLabel} <span className="text-foreground/40">·</span> {cards.length} cards
          </p>
        </div>

        {/* Binder */}
        {wide ? (
          <div className={styles.book} style={{ maxWidth: SPREAD_MAX_WIDTH[size] }}>
            <div className={styles.spread}>
              <div className={`${styles.side} ${styles.left}`}>{renderPage(leftPage)}</div>
              <div className={`${styles.side} ${styles.right}`}>{renderPage(rightPage)}</div>

              {leaf && (
                <div
                  className={`${styles.leaf} ${leaf.cls}`}
                  onAnimationEnd={(e) => {
                    if (e.target === e.currentTarget) commitFlip();
                  }}
                >
                  <div className={styles.face}>
                    {renderPage(leaf.front)}
                    <span className={styles.faceShade} aria-hidden />
                  </div>
                  <div className={`${styles.face} ${styles.faceBack}`}>
                    {renderPage(leaf.back)}
                    <span className={styles.faceShade} aria-hidden />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.book} style={{ maxWidth: SINGLE_MAX_WIDTH[size] }}>
            <div className={styles.singleViewport}>
              <div
                key={`${size}-${safePos}-${dir}`}
                className={`${styles.singleSheet} ${dir === "next" ? styles.singleNext : styles.singlePrev}`}
              >
                <div className={styles.singleFrame}>{renderPage(pageAt(safePos))}</div>
              </div>
            </div>
          </div>
        )}

        {/* Pager */}
        <div className="mt-8 flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={() => go("prev")}
            disabled={safePos === 0 || (wide && flip !== null)}
            aria-label="Previous"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition hover:border-gold/40 hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <span className="min-w-28 text-center font-mono text-sm text-muted">
            {safePos + 1} <span className="text-foreground/40">/</span> {maxPos + 1}
          </span>

          <button
            type="button"
            onClick={() => go("next")}
            disabled={safePos === maxPos || (wide && flip !== null)}
            aria-label="Next"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition hover:border-gold/40 hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {selected !== null && (
        <CardInspector
          card={cards[selected]}
          set={setMeta}
          hasPrev={selected > 0}
          hasNext={selected < cards.length - 1}
          onPrev={() => gotoCard(selected - 1)}
          onNext={() => gotoCard(selected + 1)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
