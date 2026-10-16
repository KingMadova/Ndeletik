import { landingOg, OG_SIZE, OG_TYPE } from "@/lib/og";

export const alt = "Ndeletik — Ta bio, tes liens, tes ventes";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return landingOg();
}
