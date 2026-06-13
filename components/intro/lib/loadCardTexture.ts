import * as THREE from "three";

/**
 * CORS-safe texture load. Card art is hotlinked cross-origin (the CDN sends
 * `access-control-allow-origin: *`), and a WebGL texture must be untainted —
 * so `crossOrigin` is set BEFORE `src`, and we mirror the site's no-referrer
 * convention. Rejects on error so the caller can swap in a placeholder.
 */
export function loadCardTexture(url: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error("empty url"));
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.decoding = "async";
    img.onload = () => {
      const tex = new THREE.Texture(img);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
      resolve(tex);
    };
    img.onerror = () => reject(new Error(`failed to load ${url}`));
    img.src = url;
  });
}

/** A gold-on-charcoal stand-in if a card's art can't be loaded. */
export function makePlaceholderTexture(label: string): THREE.CanvasTexture {
  const w = 512;
  const h = 716; // 5:7
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#111118";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(201, 162, 39, 0.5)";
  ctx.lineWidth = 8;
  ctx.strokeRect(14, 14, w - 28, h - 28);
  ctx.fillStyle = "#c9a227";
  ctx.font = "700 30px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const [i, word] of label.split(" ").entries()) {
    ctx.fillText(word, w / 2, h / 2 - 20 + i * 38);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
