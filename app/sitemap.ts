import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://togovest.com";
  const properties = await prisma.property.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const pages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/biens`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/espace-professionnel`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/tarifs`, changeFrequency: "monthly", priority: 0.5 },
  ];

  return [
    ...pages,
    ...properties.map((property) => ({
      url: `${baseUrl}/biens/${property.id}`,
      lastModified: property.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
