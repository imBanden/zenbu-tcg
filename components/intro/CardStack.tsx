"use client";

import { useEffect, useMemo, useState } from "react";
import type { MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { PackCard } from "./lib/packCards";
import {
  clamp01,
  easeOutCubic,
  easeInOutCubic,
  lerp,
} from "./lib/easing";
import {
  loadCardTexture,
  makePlaceholderTexture,
} from "./lib/loadCardTexture";
import type { TimelineState } from "./choreography";
import { DURATION, localMs } from "./choreography";

/** Viewport-px rect of a DOM landing slot (null = no on-screen copy). */
export type TargetRect = { x: number; y: number; w: number; h: number } | null;

const CARD_H = 2.4;
const CARD_W = CARD_H * (5 / 7);
// Composite dimming of a landed wall card: .card brightness(0.72) under the
// marquee's 0.42 dark veil ≈ 0.42 of full brightness. Tune by eye.
const DIM_LANDED = 0.42;

type Pose = { x: number; y: number; z: number; rotZ: number; sc: number };

const lerpPose = (a: Pose, b: Pose, t: number): Pose => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  z: lerp(a.z, b.z, t),
  rotZ: lerp(a.rotZ, b.rotZ, t),
  sc: lerp(a.sc, b.sc, t),
});

const center = (i: number, n: number) => i - (n - 1) / 2;
// — poses match components/test-pack/scene/CardStack.tsx so the sequence is identical —
const inPackPose = (i: number): Pose => ({ x: 0, y: 0.1, z: -0.13 + i * 0.016, rotZ: 0, sc: 1 });
const fanPose = (i: number, n: number): Pose => {
  const d = center(i, n);
  return { x: d * 0.92, y: 0.5 - Math.abs(d) * 0.13, z: 0.5 + i * 0.02, rotZ: -d * 0.2, sc: 1 };
};
const SPACING = 2.0;
const SCROLL_SPEED = 1.1; // world units / sec
const marqueePose = (i: number, n: number, ms: number): Pose => {
  const total = n * SPACING;
  let x = center(i, n) * SPACING - (ms / 1000) * SCROLL_SPEED;
  x = (((x + total / 2) % total) + total) % total - total / 2;
  return { x, y: 0, z: 1.05 + i * 0.002, rotZ: 0, sc: 0.95 };
};

/** Unproject a viewport rect onto the world plane z=zPlane → a landing pose. */
function rectToPose(
  r: NonNullable<TargetRect>,
  camera: THREE.PerspectiveCamera,
  size: { width: number; height: number },
  zPlane: number,
): Pose {
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  const v = new THREE.Vector3(
    (cx / size.width) * 2 - 1,
    -(cy / size.height) * 2 + 1,
    0.5,
  ).unproject(camera);
  const dir = v.sub(camera.position).normalize();
  const t = (zPlane - camera.position.z) / dir.z;
  const p = camera.position.clone().addScaledVector(dir, t);
  const dist = camera.position.z - zPlane;
  const visH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
  const visW = visH * camera.aspect;
  const worldW = (r.w / size.width) * visW;
  return { x: p.x, y: p.y, z: zPlane, rotZ: 0, sc: worldW / CARD_W };
}

/** Rounded-corner alpha mask ≈ the DOM card's 0.6rem radius (and real cards
 *  have rounded corners) — kills the square-corner pop at the swap. */
function makeRoundedAlpha(): THREE.CanvasTexture {
  const w = 250;
  const h = 350; // 5:7
  const r = Math.round(w * 0.063);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.arcTo(w, 0, w, h, r);
  ctx.arcTo(w, h, 0, h, r);
  ctx.arcTo(0, h, 0, 0, r);
  ctx.arcTo(0, 0, w, 0, r);
  ctx.closePath();
  ctx.fill();
  return new THREE.CanvasTexture(c);
}

/** v2 cards: same in-pack → fan → marquee ride as /test-pack, then BLEND — each
 *  card flies to its (moving) DOM slot in the hero marquee, dimming to match.
 *  Cards whose slot is off-screen fade out instead. */
export default function CardStackV2({
  clock,
  cards,
  getTargets,
}: {
  clock: MutableRefObject<TimelineState>;
  cards: PackCard[];
  getTargets: () => TargetRect[];
}) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const [textures, setTextures] = useState<THREE.Texture[] | null>(null);
  const n = cards.length;
  const refs = useMemo<MutableRefObject<THREE.Mesh | null>[]>(
    () => cards.map(() => ({ current: null })),
    [cards],
  );
  const alphaMask = useMemo(makeRoundedAlpha, []);

  useEffect(() => {
    let alive = true;
    Promise.all(
      cards.map((c) => loadCardTexture(c.image).catch(() => makePlaceholderTexture(c.name))),
    ).then((tex) => {
      if (alive) setTextures(tex);
    });
    return () => {
      alive = false;
    };
  }, [cards]);

  useFrame(() => {
    const { phase, elapsed } = clock.current;
    const blending = phase === "BLEND" || phase === "DONE";
    // one DOM read per frame, shared by all cards
    const targets = blending ? getTargets() : null;

    for (let i = 0; i < n; i++) {
      const mesh = refs[i].current;
      if (!mesh) continue;

      let pose: Pose;
      let dim = 1;
      let opacity = 1;

      if (phase === "FAN") {
        const st = easeOutCubic(clamp01((localMs(elapsed, "FAN") - 200) / 750));
        pose = lerpPose(inPackPose(i), fanPose(i, n), st);
      } else if (phase === "MARQUEE") {
        // NB: unlike test-pack, v2's MARQUEE is finite, so clock.t is a 0–1
        // fraction — the fan→marquee blend must run on milliseconds.
        const ms = localMs(elapsed, "MARQUEE");
        const blend = easeInOutCubic(clamp01(ms / 800));
        pose = lerpPose(fanPose(i, n), marqueePose(i, n, ms), blend);
      } else if (blending) {
        const bt =
          phase === "DONE" ? 1 : easeInOutCubic(clamp01(localMs(elapsed, "BLEND") / DURATION.BLEND));
        // the 3D row keeps drifting while it disperses
        const mMs = DURATION.MARQUEE + localMs(elapsed, "BLEND");
        const src = marqueePose(i, n, mMs);
        const rect = targets?.[i] ?? null;
        if (rect) {
          const dst = rectToPose(rect, camera, size, src.z);
          pose = lerpPose(src, dst, bt);
          dim = lerp(1, DIM_LANDED, bt);
        } else {
          // no on-screen slot (small viewport) — drift on and fade out
          pose = src;
          opacity = 1 - bt;
        }
      } else {
        // LOADING / REVEAL / HOLD / OPEN / CARDS_OUT — static inside the pack
        pose = inPackPose(i);
      }

      mesh.position.set(pose.x, pose.y, pose.z);
      mesh.rotation.z = pose.rotZ;
      mesh.scale.setScalar(pose.sc);
      mesh.visible = opacity > 0.01;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.color.setScalar(dim);
      mat.opacity = opacity;
    }
  });

  if (!textures) return null;
  return (
    <group>
      {cards.map((c, i) => (
        <mesh key={`${c.setCode}-${c.name}`} ref={refs[i]}>
          <planeGeometry args={[CARD_W, CARD_H]} />
          <meshBasicMaterial
            map={textures[i]}
            alphaMap={alphaMask}
            alphaTest={0.5}
            transparent
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
