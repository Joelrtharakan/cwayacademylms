import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://cwayacademy.org";
  const now = new Date();

  const staticPages = [
    { url: baseUrl, priority: 1.0, changeFrequency: "weekly" as const },
    { url: `${baseUrl}/about`, priority: 0.9, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/courses`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${baseUrl}/leadership`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/blog`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${baseUrl}/get-involved`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/contact`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/apply`, priority: 0.9, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/donate`, priority: 0.8, changeFrequency: "monthly" as const },
  ];

  const courseSlugs = [
    "foundations-biblical-theology",
    "pastoral-ministry-leadership",
    "five-fold-ministry-training",
    "evangelism-church-planting",
    "worship-arts-ministry",
    "biblical-counselling",
    "old-testament-survey",
    "new-testament-survey",
    "christian-ethics-social-justice",
  ];

  const coursePages = courseSlugs.map((slug) => ({
    url: `${baseUrl}/courses/${slug}`,
    priority: 0.8,
    changeFrequency: "monthly" as const,
    lastModified: now,
  }));

  return [
    ...staticPages.map((p) => ({ ...p, lastModified: now })),
    ...coursePages,
  ];
}
