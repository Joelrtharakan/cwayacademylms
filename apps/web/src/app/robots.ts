import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/student/",
          "/instructor/",
          "/admin/",
          "/registrar/",
          "/api/",
          "/verify/",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/references/",
        ],
      },
    ],
    sitemap: "https://cwayacademy.com/sitemap.xml",
    host: "https://cwayacademy.com",
  };
}
