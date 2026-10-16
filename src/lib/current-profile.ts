import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PROFILE_COOKIE, type DbProfile } from "./dashboard-types";

/**
 * Profil actuellement sélectionné dans le dashboard (cookie), avec repli sur le premier profil.
 * Remplace `.maybeSingle()` qui échouait dès qu'un utilisateur avait plusieurs profils.
 */
export async function getCurrentProfileRow(supabase: SupabaseClient, userId: string): Promise<DbProfile | null> {
  const { data } = await supabase.from("profiles").select("*").eq("user_id", userId);
  const rows = ((data ?? []) as DbProfile[]).slice().sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""));
  if (rows.length === 0) return null;
  const wanted = (await cookies()).get(PROFILE_COOKIE)?.value;
  return rows.find((r) => r.id === wanted) ?? rows[0];
}
