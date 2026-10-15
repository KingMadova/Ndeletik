import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SectionsEditor } from "@/components/dashboard/BlocksEditor";
import { toProfile } from "@/lib/profile-mapper";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Sections de ma page" };

export default async function SectionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: row } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
  if (!row) {
    return <main className="mx-auto max-w-xl px-6 py-24 text-center text-muted">Crée d&apos;abord ta page.</main>;
  }

  const { profile } = toProfile({ profile: row, plan: "free", links: [] });

  return (
    <SectionsEditor
      profileId={row.id}
      initialBlocks={profile.blocks ?? []}
      initialSocials={profile.socials}
    />
  );
}