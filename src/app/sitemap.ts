import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: site.url }, { url: `${site.url}/aviso-de-privacidad` }, { url: `${site.url}/terminos` }];
}
