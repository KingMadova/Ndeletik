import { redirect } from "next/navigation";
import { ThemeSelector } from "@/components/editor/ThemeSelector";
import { toProfile } from "@/lib/profile-mapper";
import { resolveTheme } from "@/lib/themes/registry";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ThemesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const [{ data: row }, { data: planData }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.rpc("my_plan"),
  ]);

  if (!row) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center text-muted">
        Crée d&apos;abord ta page pour choisir un thème.
      </main>
    );
  }

  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("profile_id", row.id)
    .order("position");

  const { profile, plan } = toProfile({ profile: row, plan: planData ?? "free", links: links ?? [] });

  // Abonnement expiré : le thème choisi est en pause, un thème gratuit s'affiche à la place.
  const { theme: shown, locked } = resolveTheme(profile.themeId, plan);

  return (
    <ThemeSelector
      profile={profile}
      plan={plan}
      currentThemeId={shown.id}
      currentCustom={profile.customTokens ?? {}}
      pausedThemeId={locked ? profile.themeId : undefined}
    />
  );
}