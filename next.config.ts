import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static-export friendly: emits a fully static `out/` directory.
  output: "export",
  // Required under static export — the default image loader is unsupported.
  images: { unoptimized: true },
};

export default nextConfig;
