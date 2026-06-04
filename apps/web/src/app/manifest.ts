import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CWAY Academy",
    short_name: "CWAY Academy",
    description: "Equipping rural pastors and Christian leaders through theological education.",
    start_url: "/",
    display: "standalone",
    background_color: "#FDF8EF",
    theme_color: "#0D1F4E",
    icons: [],
  };
}
