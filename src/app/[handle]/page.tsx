import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ProfileRenderer } from "@/components/profile/ProfileRenderer";
import { ViewBeacon } from "@/components/profile/ViewBeacon";
import { toProfile } from "@/lib/profile-mapper";
import { createPublicClient } from "@/lib/supabase/public";

// Page publique : /@slug (les routes statiques /preview, /go, /api… ont priorité sur [handle]).
export const revalidate = 60;

type Params = { handle: string };
type Props = { params: Promise<Params> | Params };

const load = cache(async (handle: string) => {
  const decoded = decodeURIComponent(handle);
  if (!decoded.startsWith("@")) return null;
  const { data } = await createPublicClient().rpc("get_public_profile", { p_slug: decoded.slice(1) });
  return data ? toProfile(data) : null;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const res = await load((await params).handle);
  if (!res) return { title: "Page introuvable" };
  return {
    title: `${res.profile.displayName} — Ndeletik`,
    description: res.profile.bio ?? res.profile.headline,
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const res = await load((await params).handle);
  if (!res) notFound();
  return (
    <>
      <ViewBeacon slug={res.profile.slug} />
      <ProfileRenderer profile={res.profile} plan={res.plan} />
    </>
  );
}