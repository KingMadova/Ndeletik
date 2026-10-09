import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const safeSlug = (slug ?? "").trim().slice(0, 100);

  if (!safeSlug) {
    return NextResponse.redirect(new URL("/", _req.url));
  }

  // Fonction SECURITY DEFINER : incrémente le compteur + renvoie l'URL cible
  const { data: url, error } = await supabase.rpc("resolve_short_link", {
    p_slug: safeSlug,
  });

  if (error || !url) {
    return NextResponse.redirect(new URL("/", _req.url));
  }

  return NextResponse.redirect(url, 302);
}