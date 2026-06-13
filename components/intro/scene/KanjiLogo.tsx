"use client";

import { useEffect, useMemo, useState } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { TimelineState } from "../choreography";
import { clamp01, easeFill } from "../lib/easing";
import { makeKanjiTexture } from "../lib/kanjiTexture";

const SIZE = 1.5; // glyph quad size in world units (fits the narrower pack)

/**
 * The 全 logo: two coplanar quads — an always-visible hairline gold outline and
 * a solid gold fill that's revealed bottom→top by an animated clipping plane
 * (mirroring LoadingIntro's clip-path fill-rise). Drawn once, crisp at any zoom.
 */
export default function KanjiLogo({
  clock,
  zFront,
  onReady,
}: {
  clock: MutableRefObject<TimelineState>;
  zFront: number;
  onReady: () => void;
}) {
  const [tex, setTex] = useState<{ outline: THREE.Texture; fill: THREE.Texture } | null>(null);
  // normal (0,-1,0): the region y <= constant is kept. Ramp constant up to reveal.
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), -SIZE / 2), []);

  useEffect(() => {
    let alive = true;
    Promise.all([makeKanjiTexture("stroke"), makeKanjiTexture("fill")]).then(
      ([outline, fill]) => {
        if (!alive) return;
        setTex({ outline, fill });
        onReady();
      },
    );
    return () => {
      alive = false;
    };
  }, [onReady]);

  useFrame(() => {
    const { phase, elapsed } = clock.current;
    if (phase === "LOADING_KANJI") {
      const fillT = easeFill(clamp01((elapsed - 200) / 1400));
      plane.constant = -SIZE / 2 + fillT * SIZE;
    } else {
      plane.constant = SIZE; // fully revealed; never clip again
    }
  });

  if (!tex) return null;
  return (
    <group position={[0, 0, zFront]}>
      <mesh>
        <planeGeometry args={[SIZE, SIZE]} />
        <meshBasicMaterial map={tex.outline} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[SIZE, SIZE]} />
        <meshBasicMaterial
          map={tex.fill}
          transparent
          depthWrite={false}
          toneMapped={false}
          clippingPlanes={[plane]}
        />
      </mesh>
    </group>
  );
}
