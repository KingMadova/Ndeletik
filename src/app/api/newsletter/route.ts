import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const SLUG = /^[a-z0-9][a-z0-9_.-]{2,29}$/;

// Formulaire du bloc newsletter (POST form-data : slug, email).
// Avant la prod : ajouter une limitation de débit / anti-spam (ex. Turnstile).
export async function POST(req: Request) {
  const form = await req.formData();
  const slug = String(form.get("slug") ?? "").toLowerCase();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!SLUG.test(slug) || !EMAIL.test(email) || email.length > 254) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("id").eq("slug", slug).maybeSingle();
  if (!profile) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const { error } = await admin.from("subscribers").insert({ profile_id: profile.id, email });
  if (error && error.code !== "23505") return NextResponse.json({ error: "failed" }, { status: 500 });
  return NextResponse.redirect(new URL(`/@${slug}?subscribed=1`, req.url), 303);
}