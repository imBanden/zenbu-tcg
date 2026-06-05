import type { MetadataRoute } from "next";

// Required under `output: export` — prerender to a static robots.txt.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://zenbutcg.com/sitemap.xml",
  };
}
