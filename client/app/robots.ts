import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/utils/server";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/cart",
          "/checkout",
          "/login",
          "/register",
          "/profile",
          "/support",
        ],
      },
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
