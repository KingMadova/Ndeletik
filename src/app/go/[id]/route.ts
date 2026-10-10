import { NextRequest, NextResponse } from "next/server";
import { safeUrl } from "@/lib/safe-url";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * /go/[id] :
 *  - UUID  → lien de profil : compte le clic (atomique) puis redirige.
 *  - sinon → raccourci personnalisé : résout le slug puis redirige.
 * L'URL cible vient TOUJOURS de la base, jamais du client.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> | { id: string } }) {
  const { id } = await ctx.params;

  // 1) Suivi de clic d'un lien de profil
  if (UUID.test(id)) {
    const admin = createAdminClient();
    const { data: link } = await admin
      .from("links")
      .select("id, url, enabled")
      .eq("id", id)
      .maybeSingle();
    if (!link || !link.enabled || !safeUrl(link.url)) {
      return new NextResponse("Lien introuvable", { status: 404 });
    }
    try {
      await createPublicClient().rpc("track_link_click", {
        p_link: link.id,
        p_referrer: req.headers.get("referer")?.slice(0, 300) ?? null,
        p_country: req.headers.get("x-vercel-ip-country")?.slice(0, 2) ?? null,
      });
    } catch {
      /* le comptage ne bloque jamais la redirection */
    }
    const res = NextResponse.redirect(link.url, 302);
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  // 2) Raccourci personnalisé (/go/mon-alias)
  const slug = id.trim().slice(0, 100);
  if (!slug) return NextResponse.redirect(new URL("/", req.url));
  const { data: url } = await createPublicClient().rpc("resolve_short_link", { p_slug: slug });
  if (!url || !safeUrl(url)) return NextResponse.redirect(new URL("/", req.url));
  const res = NextResponse.redirect(url, 302);
  res.headers.set("Cache-Control", "no-store");
  return res;
}