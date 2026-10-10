"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Crown, Lock, RotateCcw } from "lucide-react";
import { grad } from "@/components/landing/ui";
import { ProfileRenderer } from "@/components/profile/ProfileRenderer";
import { canUse } from "@/lib/entitlements";
import { planAtLeast, type Plan } from "@/lib/plans";
import { ALL_THEMES, getTheme } from "@/lib/themes/registry";
import { SAMPLE_PROFILE } from "@/lib/themes/sample";
import type { CustomTokens, Profile, Theme } from "@/lib/themes/types";
import "./editor.css";

const PLAN_LABEL: Record<Plan, string> = { free: "Gratuit", pro: "Pro", business: "Business" };
const GROUPS: Plan[] = ["free", "pro", "business"];

const COLOR_FIELDS = [
  ["accent", "Couleur principale"],
  ["accent2", "Couleur secondaire"],
  ["text", "Texte"],
  ["surface", "Cartes"],
  ["onAccent", "Texte sur couleur principale"],
  ["bg", "Fond (remplace le fond du thème)"],
] as const;

const RADIUS_OPTIONS = [
  ["", "Selon le thème"],
  ["0px", "Carré"],
  ["12px", "Arrondi"],
  ["24px", "Très arrondi"],
  ["999px", "Pilule"],
] as const;

const ERRORS: Record<string, string> = {
  unauthenticated: "Ta session a expiré. Reconnecte-toi.",
  theme_locked: "Ce thème n'est pas inclus dans ton plan.",
  theme_unknown: "Ce thème n'existe pas.",
  custom_colors_locked: "Les couleurs personnalisées sont réservées aux plans Pro et Business.",
  custom_token_invalid: "Une des couleurs n'est pas valide.",
  badge_locked: "Cette option n'est pas incluse dans ton plan.",
};

type Props = {
  profile: Profile;
  plan: Plan;
  /** Thème actuellement affiché (déjà replié sur un thème gratuit si le plan a expiré). */
  currentThemeId: string;
  currentCustom: CustomTokens;
  /** Thème choisi mais mis en pause (abonnement expiré). */
  pausedThemeId?: string;
};

function Thumb({ theme, profile, plan }: { theme: Theme; profile: Profile; plan: Plan }) {
  return (
    <div className="nd-thumb" aria-hidden>
      <div className="nd-thumb-inner">
        <ProfileRenderer profile={{ ...profile, themeId: theme.id, blocks: [] }} plan={plan} themeOverride={theme} preview />
      </div>
    </div>
  );
}

export function ThemeSelector({ profile, plan, currentThemeId, currentCustom, pausedThemeId }: Props) {
  // Nouveau profil vide : on montre les thèmes avec des données d'exemple.
  const base: Profile = profile.links.length
    ? profile
    : {
        ...profile,
        links: SAMPLE_PROFILE.links,
        socials: profile.socials.length ? profile.socials : SAMPLE_PROFILE.socials,
        blocks: SAMPLE_PROFILE.blocks,
      };

  const [selectedId, setSelectedId] = useState(currentThemeId);
  const [appliedId, setAppliedId] = useState(currentThemeId);
  const [custom, setCustom] = useState<CustomTokens>(currentCustom);
  const [appliedCustom, setAppliedCustom] = useState<CustomTokens>(currentCustom);
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "ok" | "error"; msg?: string }>({ kind: "idle" });

  const selected = getTheme(selectedId) ?? ALL_THEMES[0];
  const customAllowed = canUse(plan, "customColors");
  const themeAllowed = planAtLeast(plan, selected.plan);
  const dirty = selectedId !== appliedId || JSON.stringify(custom) !== JSON.stringify(appliedCustom);
  const paused = pausedThemeId ? getTheme(pausedThemeId) : undefined;

  function setToken<K extends keyof CustomTokens>(key: K, value: string) {
    const next = { ...custom };
    if (value) next[key] = value;
    else delete next[key];
    setCustom(next);
  }

  async function apply() {
    setStatus({ kind: "saving" });
    try {
      const res = await fetch("/api/profile/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId: selectedId, customTokens: customAllowed ? custom : undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const known = ERRORS[data?.error];
        const need = data?.requiredPlan ? ` (plan ${PLAN_LABEL[data.requiredPlan as Plan]})` : "";
        setStatus({ kind: "error", msg: known ? known + need : "Enregistrement impossible. Réessaie." });
        return;
      }
      setAppliedId(selectedId);
      setAppliedCustom(customAllowed ? custom : {});
      setStatus({ kind: "ok", msg: "Thème appliqué. Ta page est à jour." });
    } catch {
      setStatus({ kind: "error", msg: "Connexion impossible. Réessaie." });
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1fr_360px]">
      {/* Aperçu en direct */}
      <aside className="order-first lg:order-last">
        <div className="lg:sticky lg:top-6">
          <div className="nd-phone mx-auto">
            <div className="nd-screen">
              <ProfileRenderer
                profile={{ ...base, themeId: selected.id }}
                plan={plan}
                themeOverride={selected}
                customOverride={customAllowed ? custom : undefined}
                preview
              />
            </div>
          </div>
          <div className="mx-auto mt-5 max-w-[340px] text-center">
            <p className="font-display text-lg font-bold">{selected.name}</p>
            <p className="text-xs text-muted">Thème {PLAN_LABEL[selected.plan]}</p>
            {themeAllowed ? (
              <button
                onClick={apply}
                disabled={!dirty || status.kind === "saving"}
                className="mt-4 w-full rounded-full bg-ink px-5 py-3 text-sm font-medium text-bg transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                {status.kind === "saving" ? "Enregistrement…" : dirty ? "Appliquer ce thème" : "Thème en place"}
              </button>
            ) : (
              <Link
                href="/#tarifs"
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white ${grad}`}
              >
                <Crown size={16} /> Passer au plan {PLAN_LABEL[selected.plan]}
              </Link>
            )}
            <p role="status" className={`mt-3 min-h-5 text-xs ${status.kind === "error" ? "text-fractal-terra" : "text-muted"}`}>
              {status.msg}
            </p>
          </div>
        </div>
      </aside>

      {/* Choix du thème */}
      <section>
        <h1 className="font-display text-3xl font-bold">Thèmes</h1>
        <p className="mt-1 text-sm text-muted">
          Clique sur un thème pour le voir sur ta page. Les thèmes verrouillés restent visibles en aperçu.
        </p>

        {paused && (
          <div role="note" className="mt-5 rounded-2xl border border-line bg-soft p-4 text-sm">
            Ton thème <strong>{paused.name}</strong> est en pause : ton abonnement a expiré. Il reviendra dès le
            renouvellement, rien n&apos;est perdu.
          </div>
        )}

        {GROUPS.map((g) => {
          const themes = ALL_THEMES.filter((t) => t.plan === g);
          if (!themes.length) return null;
          return (
            <div key={g} className="mt-8">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted">
                {PLAN_LABEL[g]} <span className="font-normal normal-case">({themes.length})</span>
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {themes.map((t) => {
                  const locked = !planAtLeast(plan, t.plan);
                  const isSelected = t.id === selectedId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedId(t.id);
                        setStatus({ kind: "idle" });
                      }}
                      aria-pressed={isSelected}
                      className={`group rounded-2xl border-2 p-2 text-left transition ${
                        isSelected ? "border-fractal-ocre bg-surface shadow-soft" : "border-transparent hover:border-line"
                      }`}
                    >
                      <div className="relative mx-auto w-fit">
                        <Thumb theme={t} profile={base} plan={plan} />
                        {locked && (
                          <span
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white"
                            title={`Plan ${PLAN_LABEL[t.plan]} requis`}
                          >
                            <Lock size={13} />
                          </span>
                        )}
                        {t.id === appliedId && (
                          <span
                            className={`absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-white ${grad}`}
                            title="Thème actuel"
                          >
                            <Check size={14} />
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2 px-1">
                        <span className="text-sm font-semibold">{t.name}</span>
                        {locked && <span className="text-[10px] font-semibold uppercase text-fractal-terra">{PLAN_LABEL[t.plan]}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Couleurs personnalisées (Pro+) */}
        <div className="mt-12 rounded-3xl border border-line bg-surface p-6 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold">Couleurs personnalisées</h2>
              <p className="mt-1 text-sm text-muted">Adapte le thème à ta marque. Les changements s&apos;affichent en direct.</p>
            </div>
            {customAllowed && (
              <button onClick={() => setCustom({})} className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink">
                <RotateCcw size={13} /> Réinitialiser
              </button>
            )}
          </div>

          {customAllowed ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {COLOR_FIELDS.map(([key, label]) => {
                const themeValue = selected.tokens[key];
                const fallback = /^#[0-9a-fA-F]{6}$/.test(themeValue) ? themeValue : "#ffffff";
                return (
                  <label key={key} className="flex items-center justify-between gap-3 rounded-2xl bg-soft px-4 py-3 text-sm">
                    <span>{label}</span>
                    <input
                      type="color"
                      value={custom[key] && /^#[0-9a-fA-F]{6}$/.test(custom[key]!) ? custom[key] : fallback}
                      onChange={(e) => setToken(key, e.target.value)}
                      className="h-8 w-12 cursor-pointer rounded-lg border border-line bg-transparent"
                      aria-label={label}
                    />
                  </label>
                );
              })}
              <label className="flex items-center justify-between gap-3 rounded-2xl bg-soft px-4 py-3 text-sm sm:col-span-2">
                <span>Arrondi des boutons</span>
                <select
                  value={custom.radius ?? ""}
                  onChange={(e) => setToken("radius", e.target.value)}
                  className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm"
                >
                  {RADIUS_OPTIONS.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <div className="mt-5 flex flex-col items-start gap-3 rounded-2xl bg-soft p-5 text-sm">
              <span className="flex items-center gap-2 font-medium">
                <Lock size={15} /> Réservé aux plans Pro et Business
              </span>
              <Link href="/#tarifs" className={`rounded-full px-5 py-2 text-sm font-semibold text-white ${grad}`}>
                Débloquer avec Pro
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}