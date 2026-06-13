import * as THREE from "three";
import { zenKanji } from "@/lib/fonts";

const GOLD = "#c9a227";
const STROKE = "rgba(201, 162, 39, 0.85)";

// The 2-glyph subset loads with display:"block", so the real glyph isn't
// paintable until the woff2 arrives. Draw too early and we bake tofu — gate on
// fonts.ready + an explicit load of 全 in the exact hashed family.
let fontReady: Promise<void> | null = null;
function ensureFont(): Promise<void> {
  if (!fontReady) {
    fontReady = (async () => {
      try {
        await document.fonts.ready;
        await document.fonts.load(`900 200px ${zenKanji.style.fontFamily}`, "全");
      } catch {
        /* fall back to whatever the browser resolves */
      }
    })();
  }
  return fontReady;
}

/**
 * Draws 全 to an offscreen canvas and returns a CanvasTexture. `mode` picks the
 * hairline gold outline (always-visible layer) or the solid gold fill (revealed
 * bottom→top by a clipping plane). High supersample so it stays crisp on the
 * zoomed-in loading shot.
 */
export async function makeKanjiTexture(
  mode: "stroke" | "fill",
  size = 2048,
): Promise<THREE.CanvasTexture> {
  await ensureFont();
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const fontPx = size * 0.8;
  ctx.font = `900 ${fontPx}px ${zenKanji.style.fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // 全's visual mass sits a touch low (the roof is light) — nudge down, mirroring
  // LoadingIntro's 56% transform-origin.
  const cx = size / 2;
  const cy = size * 0.54;
  if (mode === "fill") {
    ctx.fillStyle = GOLD;
    ctx.fillText("全", cx, cy);
  } else {
    ctx.lineWidth = fontPx * 0.014;
    ctx.strokeStyle = STROKE;
    ctx.lineJoin = "round";
    ctx.strokeText("全", cx, cy);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}
