import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import { PublicProfile } from "@/components/public/PublicProfile";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, bio")
    .eq("username", username.toLowerCase())
    .single();

  if (!profile) {
    return { title: "Profil introuvable | Ndeletik" };
  }

  return {
    title: `${profile.username} | Ndeletik`,
    description: profile.bio || `Découvre les liens de ${profile.username} sur Ndeletik.`,
    openGraph: {
      title: `${profile.username} | Ndeletik`,
      description: profile.bio || `Découvre les liens de ${profile.username} sur Ndeletik.`,
      type: "profile",
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;

  // 1. Récupère le profil
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .single();

  if (!profile) notFound();

  // 2. Récupère ses liens actifs, dans l'ordre
  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  return <PublicProfile profile={profile} links={links ?? []} />;
}