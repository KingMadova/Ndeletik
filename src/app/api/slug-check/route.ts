import { NextResponse } from "next/server";
import { isReserved } from "@/lib/reserved";
import { createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

const SLUG = /^[a-z0-9][a-z0-9_.-]{2,29}$/;

/** GET /api/slug-check?slug=xxx → { available, reason? } (respecte la RLS via la RPC publique). */
export async function GET(req: Request) {
  const slug = (new URL(req.url).searchParams.get("slug") ?? "").toLowerCase();
  if (!SLUG.test(slug)) return NextResponse.json({ available: false, reason: "invalid" });
  if (isReserved(slug)) return NextResponse.json({ available: false, reason: "reserved" });
  const { data } = await createPublicClient().rpc("get_public_profile", { p_slug: slug });
  return NextResponse.json({ available: !data, reason: data ? "taken" : undefined });
}