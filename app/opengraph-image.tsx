import { ImageResponse } from "next/og";

export const alt =
  "Zenbu TCG — Japanese Pokémon master set lists & free printable binder placeholders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Required under `output: export` — prerender this route to a static file.
export const dynamic = "force-static";

// Build-time, static-export safe: no request-time data, flexbox-only layout.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(900px 500px at 50% -100px, rgba(201,162,39,0.18), transparent), #0a0a0f",
          color: "#e7e7ea",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
            ZENBU
          </span>
          <span style={{ fontSize: 28, color: "#c9a227" }}>全部</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            marginTop: 24,
            letterSpacing: -2,
          }}
        >
          Every card. Every Japanese set.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#a1a1aa",
            marginTop: 24,
          }}
        >
          Free printable binder placeholders · accurate JP master set lists
        </div>
      </div>
    ),
    { ...size }
  );
}
