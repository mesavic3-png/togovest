import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/dashboard/", "/compte/", "/api/"],
    },
    sitemap: "https://togovest.com/sitemap.xml",
  };
}
