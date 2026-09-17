import { ImageResponse } from "next/og";
import { renderBrandMark } from "@/lib/brandMark";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    renderBrandMark({ size: size.width, cornerRadius: 7 }),
    size,
  );
}
