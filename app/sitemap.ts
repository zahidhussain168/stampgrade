import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://stampgrade.com",
      lastModified: new Date("2026-08-14"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
