import { NextResponse } from "next/server";
import { canUse, canUseTheme, requiredPlanForTheme, sanitizeCustomTokens } from "@/lib/entitlements";
import type { Plan } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

// POST { themeId: string, customTokens?: { accent: "#FF6A1A", ... } }
// 1re barrière (messages clairs) ici ; barrière définitive = triggers SQL.
const DB_ERRORS: Record<string, number> = {
  theme_locked: 403,
  theme_unknown: 400,
  custom_colors_locked: 403,
  custom_token_invalid: 400,
  badge_locked: 403,
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const themeId = typeof body?.themeId === "string" ? body.themeId : "";
  if (!themeId) return NextResponse.json({ error: "themeId_required" }, { status: 400 });

  const { data: planData } = await supabase.rpc("my_plan");
  const plan = (["free", "pro", "business"].includes(planData) ? planData : "free") as Plan;

  if (!canUseTheme(plan, themeId)) {
    const required = requiredPlanForTheme(themeId);
    return NextResponse.json(
      { error: required ? "theme_locked" : "theme_unknown", requiredPlan: required },
      { status: required ? 403 : 400 }
    );
  }

  const update: Record<string, unknown> = { theme_id: themeId };
  if (body.customTokens !== undefined) {
    const tokens = sanitizeCustomTokens(body.customTokens);
    if (Object.keys(tokens).length && !canUse(plan, "customColors")) {
      return NextResponse.json({ error: "custom_colors_locked", requiredPlan: "pro" }, { status: 403 });
    }
    update.custom_tokens = tokens;
  }

  const { error } = await supabase.from("profiles").update(update).eq("user_id", user.id);
  if (error) {
    const hit = Object.keys(DB_ERRORS).find((k) => error.message.includes(k));
    if (hit) return NextResponse.json({ error: hit }, { status: DB_ERRORS[hit] });
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, plan, themeId });
}