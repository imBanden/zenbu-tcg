"use client";

import { useEffect, useRef } from "react";
import type { Card, CardSetMeta } from "@/lib/cards/types";
import { holoMeta } from "@/lib/cards/rarity";
import TiltCard from "./TiltCard";
import CardFace from "./CardFace";
import styles from "./CardInspector.module.css";

type Props = {
  card: Card;
  set: CardSetMeta;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
};

export default function CardInspector({
  card,
  set,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
}: Props) {
  const meta = holoMeta(card.holoTier);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const num = String(card.number).padStart(3, "0");

  // Mount-only: lock scroll, move focus in, and restore focus on close.
  // (Separate from the key handler so navigation never re-steals focus.)
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  // Keyboard: Escape, Arrow navigation, and a Tab focus-trap within the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowLeft" && hasPrev) {
        onPrev();
        return;
      }
      if (e.key === "ArrowRight" && hasNext) {
        onNext();
        return;
      }
      if (e.key === "Tab") {
        const root = dialogRef.current;
        if (!root) return;
        const focusables = Array.from(
          root.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasPrev, hasNext, onPrev, onNext, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${card.name}, card ${num} of ${set.total}`}
      className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-8"
    >
      {/* Click-to-dismiss backdrop — not a focusable control (Escape + X cover keyboard). */}
      <div
        aria-hidden
        onClick={onClose}
        className={`absolute inset-0 bg-black/80 backdrop-blur-md ${styles.backdrop}`}
      />

      <div
        ref={dialogRef}
        className={`relative z-10 flex w-full max-w-3xl flex-col items-center gap-6 sm:flex-row sm:items-stretch sm:gap-10 ${styles.dialog}`}
      >
        {/* The inspectable card (non-interactive: pointer-tilt only) */}
        <div className="w-[68vw] max-w-75 shrink-0 sm:w-75">
          <TiltCard tier={card.holoTier} glow={meta.glow} maxTilt={16} ariaLabel={`${card.name} card art`}>
            <CardFace card={card} set={set} />
          </TiltCard>
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col justify-center text-center sm:text-left">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            {card.badge ? (
              <span className={`rounded border px-2 py-0.5 font-mono text-xs font-semibold ${meta.chip}`}>
                {card.badge}
              </span>
            ) : null}
            <span className="font-mono text-xs text-muted">
              {num} / {set.total}
            </span>
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            {card.name}
          </h2>
          <p className="mt-1 text-sm text-muted">{card.label}</p>
          <p className="mt-5 hidden text-xs text-muted sm:block">
            Move your pointer across the card to tilt it and catch the shine.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3 sm:justify-start">
            <button
              type="button"
              onClick={onPrev}
              disabled={!hasPrev}
              aria-label="Previous card"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition hover:border-gold/40 hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!hasNext}
              aria-label="Next card"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition hover:border-gold/40 hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Close (X) */}
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close inspector"
          className="absolute -right-1 -top-12 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 text-foreground transition hover:border-gold/40 hover:text-gold sm:-right-12 sm:top-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
