import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ProfileRenderer } from "@/components/profile/ProfileRenderer";
import { ViewBeacon } from "@/components/profile/ViewBeacon";
import { DEMO_PROFILE } from "@/lib/themes/demo";
import { toProfile } from "@/lib/profile-mapper";
import { createPublicClient } from "@/lib/supabase/public";

// Page publique : /@slug (les routes statiques /preview, /go, /api… ont priorité sur [handle]).
export const revalidate = 60;

type Params = { handle: string };

/** Le segment dynamique peut arriver encodé (« %40demo ») : on le normalise avant toute comparaison. */
const decodeHandle = (raw: string) => {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};
type Props = { params: Promise<Params> | Params };

const load = cache(async (handle: string) => {
  const decoded = decodeURIComponent(handle);
  if (!decoded.startsWith("@")) return null;
  const { data } = await createPublicClient().rpc("get_public_profile", { p_slug: decoded.slice(1) });
  return data ? toProfile(data) : null;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const handle = decodeHandle((await params).handle);
  if (handle === "@demo") {
    const description = "Découvre les blocs Ndeletik : offres, contact, séparateurs, newsletter, sur un thème Business.";
    return {
      title: "Démo",
      description,
      openGraph: { title: "Démo — Ndeletik", description, type: "website", siteName: "Ndeletik", locale: "fr_FR" },
      twitter: { card: "summary_large_image", title: "Démo — Ndeletik", description },
    };
  }
  const res = await load(handle);
  if (!res) return { title: "Page introuvable" };
  const description = res.profile.bio ?? res.profile.headline;
  const title = res.profile.displayName;
  return {
    title,
    description,
    // Le bloc openGraph du layout est remplacé en entier : on le redéclare avec le nom du profil.
    openGraph: { title: `${title} — Ndeletik`, description, type: "profile", siteName: "Ndeletik", locale: "fr_FR" },
    twitter: { card: "summary_large_image", title: `${title} — Ndeletik`, description },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const handle = decodeHandle((await params).handle);

  // Vitrine statique des nouveaux designs : aucun profil « demo » en base (slug réservé).
  if (handle === "@demo") {
    return <ProfileRenderer profile={DEMO_PROFILE} plan="business" preview />;
  }

  const res = await load(handle);
  if (!res) notFound();
  return (
    <>
      <ViewBeacon slug={res.profile.slug} />
      <ProfileRenderer profile={res.profile} plan={res.plan} />
    </>
  );
}