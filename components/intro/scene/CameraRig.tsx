"use client";

import type { MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { TimelineState } from "../choreography";
import { START, DURATION } from "../choreography";
import { clamp01, easeInOutCubic, lerp } from "../lib/easing";

// Dolly keyframes (camera distance on +Z).
const Z_NEAR = 1.9; // glued inside the glyph — 全 fills the frame
const Z_FAR = 5.6; // the whole (taller) pack framed
const Z_WIDE = 7.0; // pulled back for the fan + marquee spread

export default function CameraRig({ clock }: { clock: MutableRefObject<TimelineState> }) {
  const cam = useThree((s) => s.camera);

  useFrame(() => {
    const e = clock.current.elapsed;
    const reveal = easeInOutCubic(clamp01((e - START.REVEAL) / DURATION.REVEAL));
    const widen = easeInOutCubic(
      clamp01((e - START.CARDS_OUT) / (DURATION.CARDS_OUT + DURATION.FAN)),
    );
    const z = lerp(lerp(Z_NEAR, Z_FAR, reveal), Z_WIDE, widen);
    cam.position.set(0, 0, z);
    cam.lookAt(0, 0, 0);
  });

  return null;
}
