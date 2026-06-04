import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/verify/", "/login"],
      },
    ],
    sitemap: "https://cwayacademy.org/sitemap.xml",
    host: "https://cwayacademy.org",
  };
}
