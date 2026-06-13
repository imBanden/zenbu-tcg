import localFont from "next/font/local";

// Brand kanji face: Noto Sans JP Black (OFL), self-hosted subset containing
// only 全 + 部 (1.1 KB) — this Next fork's next/font/google has no JP subsets.
// display:block avoids a fallback flash on the giant intro glyph.
//
// Exported as a single source of truth so both the root layout (which injects
// the `--font-zen-mincho` CSS variable) and the WebGL kanji texture (which reads
// `zenKanji.style.fontFamily` for a 2D-canvas `ctx.font`) use the same hashed
// font-family name.
export const zenKanji = localFont({
  src: "../app/fonts/noto-sans-jp-zenbu.woff2",
  weight: "900",
  variable: "--font-zen-mincho",
  display: "block",
});
