"use client";

import { useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { DirectionalLight } from "three";
import type { TimelineState } from "../choreography";
import { START } from "../choreography";
import { clamp01, easeOutCubic } from "../lib/easing";

/**
 * Lights stay near-dark through LOADING so the pack face reads as pure black
 * behind the gold 全 (the "loading screen" look). They ramp up across REVEAL —
 * warm rim lights from behind carve the black foil's silhouette out of the
 * near-black background.
 */
export default function Lighting({ clock }: { clock: MutableRefObject<TimelineState> }) {
  const key = useRef<DirectionalLight>(null);
  const rimL = useRef<DirectionalLight>(null);
  const rimR = useRef<DirectionalLight>(null);

  useFrame(() => {
    const up = easeOutCubic(clamp01((clock.current.elapsed - START.REVEAL) / 900));
    if (key.current) key.current.intensity = 0.18 + up * 0.55;
    if (rimL.current) rimL.current.intensity = up * 2.8;
    if (rimR.current) rimR.current.intensity = up * 1.9;
  });

  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight ref={key} position={[0.6, 1.4, 4]} intensity={0.18} />
      <directionalLight ref={rimL} position={[-4, 2.6, -3]} intensity={0} color="#ffe8ad" />
      <directionalLight ref={rimR} position={[4, -1.2, -2.6]} intensity={0} color="#c9a227" />
    </>
  );
}
