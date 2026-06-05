import type { MetadataRoute } from "next";
import { sets } from "@/lib/sets";

// Required under `output: export` — prerender to a static sitemap.xml.
export const dynamic = "force-static";

// Fixed lastModified for deterministic, reproducible static builds.
const LASTMOD = new Date("2026-06-05");
const BASE = "https://zenbutcg.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, lastModified: LASTMOD, changeFrequency: "weekly", priority: 1 },
    ...sets
      .filter((s) => s.available)
      .map((s) => ({
        url: `${BASE}/sets/${s.slug}`,
        lastModified: LASTMOD,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
  ];
}
