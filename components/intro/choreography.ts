// The single source of truth for the intro timeline: pack-opening → finite
// MARQUEE drift → BLEND (3D cards fly into the hero's DOM marquee slots) → DONE.
// Every scene module (FoilPack, KanjiLogo, Lighting, CameraRig), the clock, and
// the card stack all read from here, so nothing can desync.

export const PHASES = [
  "LOADING_KANJI", // camera inside 全; gold fill rises bottom→top
  "REVEAL", // dolly out — 全 resolves as the logo on a black pack
  "HOLD", // the pack sits, a subtle float
  "OPEN", // the top crimp rips off
  "CARDS_OUT", // the pack slides down, uncovering the card stack inside
  "FAN", // the cards spread into a held hand-fan
  "MARQUEE", // and drift as a row (finite, before the handoff)
  "BLEND", // each card flies into its slot in the hero marquee
  "DONE", // terminal — the DOM marquee has taken over
] as const;

export type Phase = (typeof PHASES)[number];

/** Per-phase duration in ms. DONE is open-ended. */
export const DURATION: Record<Phase, number> = {
  LOADING_KANJI: 1500,
  REVEAL: 800,
  HOLD: 400,
  OPEN: 500,
  CARDS_OUT: 300,
  FAN: 1500,
  MARQUEE: 2200,
  BLEND: 1000,
  DONE: Infinity,
};

/** Cumulative start time (ms) of each phase. */
export const START: Record<Phase, number> = (() => {
  const out = {} as Record<Phase, number>;
  let acc = 0;
  for (const p of PHASES) {
    out[p] = acc;
    acc += DURATION[p];
  }
  return out;
})();

export type TimelineState = {
  /** ms since the sequence started. */
  elapsed: number;
  phase: Phase;
  /** Progress within the current phase: 0→1 (raw ms for DONE). */
  t: number;
  phaseIndex: number;
};

export function phaseAt(elapsed: number): {
  phase: Phase;
  t: number;
  index: number;
} {
  for (let i = PHASES.length - 1; i >= 0; i--) {
    const p = PHASES[i];
    if (elapsed >= START[p]) {
      const dur = DURATION[p];
      const local = elapsed - START[p];
      return { phase: p, t: dur === Infinity ? local : Math.min(1, local / dur), index: i };
    }
  }
  return { phase: "LOADING_KANJI", t: 0, index: 0 };
}

/** Local ms into a phase (clamped at 0). */
export function localMs(elapsed: number, phase: Phase): number {
  return Math.max(0, elapsed - START[phase]);
}
