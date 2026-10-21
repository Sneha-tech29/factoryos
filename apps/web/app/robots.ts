import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://factoryos.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/privacy", "/terms", "/cookies", "/login", "/register"],
        disallow: ["/api/", "/dashboard/", "/setup/", "/worker/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
