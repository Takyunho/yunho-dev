import type { MetadataRoute } from "next";
import { PROFILE } from "@/content/profile";

// 단일 페이지 사이트라서 항목은 하나다. 페이지를 추가하면 여기에도 추가한다
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: PROFILE.siteUrl, changeFrequency: "monthly", priority: 1 }];
}
