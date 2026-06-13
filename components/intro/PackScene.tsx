"use client";

import { useCallback, useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { PackCard } from "./lib/packCards";
import { clamp01, easeInOutCubic } from "./lib/easing";
import Lighting from "./scene/Lighting";
import CameraRig from "./scene/CameraRig";
import FoilPack from "./scene/FoilPack";
import KanjiLogo from "./scene/KanjiLogo";
import type { TimelineState } from "./choreography";
import { phaseAt, START, DURATION } from "./choreography";
import CardStack, { type TargetRect } from "./CardStack";

const Z_FRONT = 0.07; // logo / crimp sit just in front of the pack face

/** Idle float, then the pack slides straight down to uncover the card stack. */
function PackFloat({
  clock,
  children,
}: {
  clock: MutableRefObject<TimelineState>;
  children: React.ReactNode;
}) {
  const g = useRef<Group>(null);
  useFrame(() => {
    const e = clock.current.elapsed;
    const life = clamp01((e - START.HOLD) / 600) * (1 - clamp01((e - START.OPEN) / 350));
    const slide = easeInOutCubic(clamp01((e - START.CARDS_OUT) / DURATION.CARDS_OUT));
    if (g.current) {
      g.current.position.y = Math.sin(e * 0.0012) * 0.05 * life - slide * 8.0;
      g.current.rotation.y = Math.sin(e * 0.0009) * 0.04 * life;
      g.current.rotation.z = Math.sin(e * 0.0007) * 0.015 * life;
    }
  });
  return <group ref={g}>{children}</group>;
}

function Scene({
  cards,
  skipNonce,
  getTargets,
  onBlendStart,
  onBlendComplete,
}: {
  cards: PackCard[];
  skipNonce: number;
  getTargets: () => TargetRect[];
  onBlendStart: () => void;
  onBlendComplete: () => void;
}) {
  const clock = useRef<TimelineState>({
    elapsed: 0,
    phase: "LOADING_KANJI",
    t: 0,
    phaseIndex: 0,
  });
  const ready = useRef(false);
  const blendStarted = useRef(false);
  const blendDone = useRef(false);

  // skip = jump the clock to the blend, so even a skip stays connected
  useEffect(() => {
    if (skipNonce > 0 && clock.current.elapsed < START.BLEND) {
      clock.current.elapsed = START.BLEND;
    }
  }, [skipNonce]);

  useFrame((state, delta) => {
    state.gl.localClippingEnabled = true; // powers the kanji fill-rise clip
    if (!ready.current) return;
    const c = clock.current;
    c.elapsed += Math.min(delta, 0.05) * 1000;
    const p = phaseAt(c.elapsed);
    c.phase = p.phase;
    c.t = p.t;
    c.phaseIndex = p.index;

    if ((p.phase === "BLEND" || p.phase === "DONE") && !blendStarted.current) {
      blendStarted.current = true;
      onBlendStart();
    }
    if (p.phase === "DONE" && !blendDone.current) {
      blendDone.current = true;
      onBlendComplete();
    }
  });

  const onKanjiReady = useCallback(() => {
    ready.current = true;
  }, []);

  return (
    <>
      <Lighting clock={clock} />
      <CameraRig clock={clock} />
      <PackFloat clock={clock}>
        <FoilPack clock={clock} zFront={Z_FRONT} />
        <KanjiLogo clock={clock} zFront={Z_FRONT} onReady={onKanjiReady} />
      </PackFloat>
      <CardStack clock={clock} cards={cards} getTargets={getTargets} />
    </>
  );
}

export default function PackScene(props: {
  cards: PackCard[];
  skipNonce: number;
  getTargets: () => TargetRect[];
  onBlendStart: () => void;
  onBlendComplete: () => void;
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 1.9], fov: 45, near: 0.1, far: 100 }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      style={{ position: "absolute", inset: 0 }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
