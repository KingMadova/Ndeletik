import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug.toLowerCase().slice(0, 40) : "";
  if (!slug) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { error } = await createPublicClient().rpc("increment_views", { p_slug: slug });
  if (error) return NextResponse.json({ error: "failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}