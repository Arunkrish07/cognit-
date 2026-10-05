import type { MetadataRoute } from "next";
import { site } from "@/data/site";

const routes = ["", "/services", "/work", "/process", "/faq"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map((path) => ({
    url: `${site.domain}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
