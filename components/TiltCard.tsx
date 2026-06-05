"use client";

import { useCallback, useRef, type CSSProperties, type ReactNode } from "react";
import styles from "./TiltCard.module.css";

type TiltCardProps = {
  children: ReactNode;
  /** Holographic intensity tier (0–5). */
  tier?: number;
  /** rgba glow color for the hover shadow. */
  glow?: string;
  /** Maximum tilt in degrees on each axis. */
  maxTilt?: number;
  /** When provided, the card is an interactive button (click/Enter/Space). */
  onActivate?: () => void;
  ariaLabel?: string;
};

/**
 * Reusable card that tilts toward the pointer in 3D and casts an angle-dependent
 * holographic shine. Respects prefers-reduced-motion. Renders as a <button> only
 * when `onActivate` is given; otherwise a non-interactive <div role="img"> so it
 * never becomes a focusable no-op.
 */
export default function TiltCard({
  children,
  tier = 0,
  glow = "transparent",
  maxTilt = 14,
  onActivate,
  ariaLabel,
}: TiltCardProps) {
  const sceneRef = useRef<HTMLElement | null>(null);
  const frame = useRef<number | null>(null);
  const setRef = (el: HTMLElement | null) => {
    sceneRef.current = el;
  };
  const setVar = (key: string, value: string) => sceneRef.current?.style.setProperty(key, value);

  const handleMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const el = sceneRef.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const rect = el.getBoundingClientRect();
      const cx = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      const cy = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);

      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        el.classList.remove(styles.resting);
        setVar("--ry", `${(cx - 0.5) * maxTilt * 2}deg`);
        setVar("--rx", `${-(cy - 0.5) * maxTilt * 2}deg`);
        setVar("--mx", `${cx * 100}%`);
        setVar("--my", `${cy * 100}%`);
        setVar("--active", "1");
      });
    },
    [maxTilt],
  );

  const handleLeave = useCallback(() => {
    const el = sceneRef.current;
    if (!el) return;
    if (frame.current) cancelAnimationFrame(frame.current);
    el.classList.add(styles.resting);
    setVar("--rx", "0deg");
    setVar("--ry", "0deg");
    setVar("--mx", "50%");
    setVar("--my", "50%");
    setVar("--active", "0");
  }, []);

  const inner = (
    <div className={styles.card}>
      <div className={styles.content}>{children}</div>
      <div className={`${styles.layer} ${styles.foil}`} aria-hidden />
      <div className={`${styles.layer} ${styles.glare}`} aria-hidden />
    </div>
  );

  if (typeof onActivate === "function") {
    return (
      <button
        ref={setRef}
        type="button"
        className={styles.scene}
        data-tier={tier}
        style={{ "--glow": glow } as CSSProperties}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        onPointerCancel={handleLeave}
        onClick={onActivate}
        aria-label={ariaLabel}
      >
        {inner}
      </button>
    );
  }

  return (
    <div
      ref={setRef}
      className={styles.scene}
      data-tier={tier}
      style={{ "--glow": glow, cursor: "default" } as CSSProperties}
      role="img"
      aria-label={ariaLabel}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onPointerCancel={handleLeave}
    >
      {inner}
    </div>
  );
}
