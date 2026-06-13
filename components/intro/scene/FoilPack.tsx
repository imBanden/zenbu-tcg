"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { TimelineState } from "../choreography";
import { START, DURATION } from "../choreography";
import { clamp01, easeOutCubic, easeInOutCubic } from "../lib/easing";
import { loadCardTexture } from "../lib/loadCardTexture";

// Real foil-bag photo (cropped to the pack). Aspect drives the proportions.
const PACK_SRC = "/img/pack.png";
const PACK_ASPECT = 1446 / 766; // cropped photo H/W
export const PACK_W = 1.95;
export const PACK_H = PACK_W * PACK_ASPECT;
const SEAM = 0.9; // split: crimp = top 10%, body = bottom 90%

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Rounded-rect alpha to clip the gray edges/corners off the cropped photo. */
function makeAlphaMask(): THREE.CanvasTexture {
  const w = 512;
  const h = Math.round(512 * PACK_ASPECT);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#fff";
  roundedRect(ctx, w * 0.015, w * 0.015, w - w * 0.03, h - w * 0.03, w * 0.05);
  ctx.fill();
  return new THREE.CanvasTexture(c);
}

/** Radial gold glow for the "light spills out" bloom at the slit. */
function makeRadialTexture(): THREE.CanvasTexture {
  const s = 256;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255, 233, 170, 0.95)");
  g.addColorStop(0.4, "rgba(201, 162, 39, 0.45)");
  g.addColorStop(1, "rgba(201, 162, 39, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function FoilPack({
  clock,
  zFront,
}: {
  clock: MutableRefObject<TimelineState>;
  zFront: number;
}) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const bodyMat = useRef<THREE.MeshBasicMaterial>(null);
  const crimpMat = useRef<THREE.MeshBasicMaterial>(null);
  const crimpGroup = useRef<THREE.Group>(null);
  const spill = useRef<THREE.Mesh>(null);
  const spillMat = useRef<THREE.MeshBasicMaterial>(null);

  const mask = useMemo(makeAlphaMask, []);
  const radial = useMemo(makeRadialTexture, []);

  useEffect(() => {
    let alive = true;
    loadCardTexture(PACK_SRC)
      .then((t) => {
        if (alive) setTex(t);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Split the one photo into a body region + a crimp region via UV (texture clones).
  const maps = useMemo(() => {
    if (!tex) return null;
    const slice = (src: THREE.Texture, oy: number, ry: number) => {
      const c = src.clone();
      c.offset.set(0, oy);
      c.repeat.set(1, ry);
      c.needsUpdate = true;
      return c;
    };
    return {
      bodyMap: slice(tex, 0, SEAM),
      crimpMap: slice(tex, SEAM, 1 - SEAM),
      bodyAlpha: slice(mask, 0, SEAM),
      crimpAlpha: slice(mask, SEAM, 1 - SEAM),
    };
  }, [tex, mask]);

  const bodyH = PACK_H * SEAM;
  const crimpH = PACK_H * (1 - SEAM);
  const bodyY = -PACK_H / 2 + bodyH / 2;
  const crimpY = PACK_H / 2 - crimpH / 2;

  useFrame(() => {
    const e = clock.current.elapsed;

    // the foil fades in from black across the reveal (so LOADING stays black)
    const up = easeOutCubic(clamp01((e - START.REVEAL) / 900));
    if (bodyMat.current) bodyMat.current.color.setScalar(up);
    if (crimpMat.current) crimpMat.current.color.setScalar(up);

    // horizontal rip: a small grab, then tear the crimp off to the side
    const openT = clamp01((e - START.OPEN) / DURATION.OPEN);
    const grab = easeOutCubic(clamp01(openT / 0.2));
    const rip = easeInOutCubic(clamp01((openT - 0.2) / 0.8));
    if (crimpGroup.current) {
      crimpGroup.current.position.x = -0.05 * grab + PACK_W * 1.85 * rip;
      crimpGroup.current.position.y = crimpY + 0.06 * grab + 0.25 * rip;
      crimpGroup.current.position.z = 0.05 * rip;
      crimpGroup.current.rotation.z = -0.04 * grab - 0.55 * rip;
    }

    // gold light spills from the slit (0→1→0), growing
    const spillT = clamp01((e - START.OPEN) / (DURATION.OPEN + 350));
    if (spillMat.current)
      spillMat.current.opacity = Math.sin(clamp01(spillT) * Math.PI) * 0.9;
    if (spill.current) {
      const sc = 1 + spillT * 1.9;
      spill.current.scale.set(sc, sc, sc);
    }
  });

  // black stand-in keeps the cards occluded until the photo loads
  if (!maps) {
    return (
      <mesh>
        <planeGeometry args={[PACK_W, PACK_H]} />
        <meshBasicMaterial color="#050507" toneMapped={false} />
      </mesh>
    );
  }

  return (
    <group>
      {/* pack body (photo, bottom 90%) */}
      <mesh position={[0, bodyY, 0]}>
        <planeGeometry args={[PACK_W, bodyH]} />
        <meshBasicMaterial
          ref={bodyMat}
          map={maps.bodyMap}
          alphaMap={maps.bodyAlpha}
          alphaTest={0.5}
          color="#000000"
          toneMapped={false}
        />
      </mesh>

      {/* crimp seal (photo, top 10%) — rips off horizontally */}
      <group ref={crimpGroup} position={[0, crimpY, 0]}>
        <mesh>
          <planeGeometry args={[PACK_W, crimpH]} />
          <meshBasicMaterial
            ref={crimpMat}
            map={maps.crimpMap}
            alphaMap={maps.crimpAlpha}
            alphaTest={0.5}
            color="#000000"
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* gold light spill at the slit */}
      <mesh ref={spill} position={[0, PACK_H / 2 - 0.25, zFront + 0.04]}>
        <planeGeometry args={[PACK_W * 1.1, 1.3]} />
        <meshBasicMaterial
          ref={spillMat}
          map={radial}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
