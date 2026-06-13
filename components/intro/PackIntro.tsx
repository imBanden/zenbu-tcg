"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PackCard } from "./lib/packCards";
import type { TargetRect } from "./CardStack";

// Three.js graph stays behind this boundary: no SSG eval, code-split off the
// rest of the page, and never even fetched for repeat visitors (see `play`).
const PackScene = dynamic(() => import("./PackScene"), {
  ssr: false,
  loading: () => null,
});

// Gimmick, not a gate the user fights: play once per session, like the old intro.
const SEEN_KEY = "zenbu-pack-intro-v1";
// Hard-cut to the page if the blend never fires (dead WebGL, stuck textures).
const SAFETY_MS = 14000;

type Phase = "playing" | "blending" | "done";

/**
 * The homepage intro: the pack-opening plays over the real landing page (a
 * site-matched dark floor + a transparent WebGL canvas). At BLEND the floor
 * fades and the 3D cards fly into the hero marquee's reserved slots, so the
 * intro's marquee becomes the hero's marquee with no visible handoff.
 *
 * Plays at most once per session; repeat visitors are dropped straight onto the
 * page with no flash (synchronous guard below + `play` keeps three.js unloaded).
 */
export default function PackIntro({ cards }: { cards: PackCard[] }) {
  const [phase, setPhase] = useState<Phase>("playing");
  const [play, setPlay] = useState(false); // mount the heavy canvas only for first-timers
  const [skipNonce, setSkipNonce] = useState(0);
  const hidden = useRef<HTMLElement[]>([]);

  const restoreTargets = useCallback(() => {
    for (const el of hidden.current) el.style.visibility = "";
    hidden.current = [];
  }, []);

  /** Per-frame landing rects for slots 0–4. Each slot has two doubled-track
   *  copies — pick the one nearest viewport center; null if both are off-screen. */
  const getTargets = useCallback((): TargetRect[] => {
    const vw = window.innerWidth;
    return [0, 1, 2, 3, 4].map((slot) => {
      const els = document.querySelectorAll<HTMLElement>(`[data-pack-slot="${slot}"]`);
      let best: TargetRect = null;
      let bestScore = -Infinity;
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0) return;
        const margin = vw * 0.3;
        if (r.right < -margin || r.left > vw + margin) return;
        const score = -Math.abs((r.left + r.right) / 2 - vw / 2);
        if (score > bestScore) {
          bestScore = score;
          best = { x: r.left, y: r.top, w: r.width, h: r.height };
        }
      });
      return best;
    });
  }, []);

  const onBlendStart = useCallback(() => {
    document.querySelectorAll<HTMLElement>("[data-pack-slot]").forEach((el) => {
      el.style.visibility = "hidden";
      hidden.current.push(el);
    });
    setPhase("blending");
  }, []);

  const onBlendComplete = useCallback(() => {
    restoreTargets();
    document.body.style.overflow = "";
    setPhase("done");
  }, [restoreTargets]);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("done");
      return;
    }
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
    setPlay(true);
    document.body.style.overflow = "hidden";
    const safety = window.setTimeout(() => {
      restoreTargets();
      document.body.style.overflow = "";
      setPhase("done");
    }, SAFETY_MS);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ")
        setSkipNonce((k) => k + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(safety);
      window.removeEventListener("keydown", onKey);
      restoreTargets();
      document.body.style.overflow = "";
    };
  }, [restoreTargets]);

  if (phase === "done") return null;

  const blending = phase === "blending";
  return (
    <div
      aria-hidden="true"
      onPointerDown={() => setSkipNonce((k) => k + 1)}
      className="fixed inset-0 z-100"
      style={{ pointerEvents: blending ? "none" : "auto", cursor: "pointer" }}
    >
      {/* Synchronous guard: repeat visitors never see a first-frame flash. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem("${SEEN_KEY}"))document.currentScript.parentElement.style.display="none"}catch(e){}`,
        }}
      />
      {/* dark stage floor (matches the site bg) — fades as the cards fly into the page */}
      <div
        className="site-bg absolute inset-0"
        style={{ transition: "opacity 650ms ease", opacity: blending ? 0 : 1 }}
      />
      {play && (
        <PackScene
          cards={cards}
          skipNonce={skipNonce}
          getTargets={getTargets}
          onBlendStart={onBlendStart}
          onBlendComplete={onBlendComplete}
        />
      )}
    </div>
  );
}
