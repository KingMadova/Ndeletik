"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2, SkipForward, Copy, Check } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { FREE_THEMES } from "@/lib/themes/free";
import { LinkTemplates } from "@/components/dashboard/LinkTemplates";
import { detectIcon } from "@/lib/detect-icon";
import { normalizeUrl } from "@/components/dashboard/blockMeta";

const STEPS = ["Profil", "Premier lien", "Thème", "Prêt !"] as const;
type Step = (typeof STEPS)[number];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("Profil");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slug, setSlug] = useState("");
  const [copied, setCopied] = useState(false);

  // Étape 1 : Profil
  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");

  // Étape 2 : Premier lien
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  // Étape 3 : Thème
  const [selectedThemeId, setSelectedThemeId] = useState(FREE_THEMES[0].id);

  const next = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  };

  const prev = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  };

  const publicUrl =
    typeof window !== "undefined" && slug ? `${window.location.origin}/@${slug}` : "";

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* copie impossible */
    }
  };

  const complete = async (skip = false) => {
    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expirée");

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, slug")
        .eq("user_id", user.id)
        .single();

      if (!profile) throw new Error("Profil introuvable");
      setSlug(profile.slug);

      if (!skip) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            display_name: displayName || "Mon profil",
            headline: headline || null,
            bio: bio || null,
            theme_id: selectedThemeId,
            onboarding_completed: true,
          })
          .eq("id", profile.id);

        if (profileError) throw profileError;

        if (linkTitle && linkUrl) {
          const clean = normalizeUrl(linkUrl);
          const { error: linkError } = await supabase.from("links").insert({
            profile_id: profile.id,
            title: linkTitle,
            url: clean,
            icon: detectIcon(clean),
            position: 0,
          });
          if (linkError) throw linkError;
        }
      } else {
        const { error: skipError } = await supabase
          .from("profiles")
          .update({ onboarding_completed: true })
          .eq("id", profile.id);
        if (skipError) throw skipError;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:border-fractal-ocre transition-colors";

  return (
    <div className="min-h-screen bg-bg p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header avec progression */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`h-2 w-2 rounded-full ${
                    STEPS.indexOf(step) >= i ? "bg-fractal-ocre" : "bg-line"
                  }`}
                />
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 w-8 ${
                      STEPS.indexOf(step) > i ? "bg-fractal-ocre" : "bg-line"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => complete(true)}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-fractal-terra transition-colors disabled:opacity-40"
          >
            <SkipForward size={14} /> Passer
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-fractal-terra/30 bg-fractal-terra/10 p-3 text-sm text-fractal-terra">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === "Profil" && (
            <motion.div
              key="profil"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-3xl border border-line bg-surface p-6 shadow-soft"
            >
              <h1 className="font-display text-2xl font-bold mb-2">👤 Ton profil</h1>
              <p className="text-sm text-muted mb-6">Comment veux-tu apparaître sur ta page ?</p>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs font-medium text-ink mb-1.5 block">Nom affiché *</span>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ex : Alvine Coach"
                    className={inputCls}
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-ink mb-1.5 block">Titre (sous le nom)</span>
                  <input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Ex : Coach business · Pointe-Noire"
                    className={inputCls}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-ink mb-1.5 block">Bio (optionnel)</span>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Présente-toi en quelques mots…"
                    rows={3}
                    className={inputCls}
                  />
                </label>
              </div>

              <button
                onClick={next}
                disabled={!displayName.trim() || loading}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-fractal-ocre hover:bg-fractal-terra px-5 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-40"
              >
                Continuer <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {step === "Premier lien" && (
            <motion.div
              key="lien"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-3xl border border-line bg-surface p-6 shadow-soft"
            >
              <h1 className="font-display text-2xl font-bold mb-2">🔗 Ton premier lien</h1>
              <p className="text-sm text-muted mb-6">Où veux-tu que tes visiteurs aillent en premier ?</p>

              <LinkTemplates
                onAdd={async (title, url) => {
                  setLinkTitle(title);
                  setLinkUrl(url);
                  return true;
                }}
              />

              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-xs font-medium text-ink mb-1.5 block">Titre</span>
                  <input
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    placeholder="Ex : Mon WhatsApp"
                    className={inputCls}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-ink mb-1.5 block">URL</span>
                  <input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://wa.me/…"
                    className={inputCls}
                  />
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={prev}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-line px-5 py-3 text-sm font-medium text-muted hover:bg-soft transition-colors disabled:opacity-40"
                >
                  <ArrowLeft size={16} /> Précédent
                </button>
                <button
                  onClick={next}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-fractal-ocre hover:bg-fractal-terra px-5 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-40"
                >
                  Continuer <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === "Thème" && (
            <motion.div
              key="theme"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-3xl border border-line bg-surface p-6 shadow-soft"
            >
              <h1 className="font-display text-2xl font-bold mb-2">🎨 Choisis un thème</h1>
              <p className="text-sm text-muted mb-6">Tu pourras le changer plus tard dans l'éditeur de thèmes.</p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {FREE_THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedThemeId(t.id)}
                    className={`rounded-2xl border-2 p-3 text-center transition ${
                      selectedThemeId === t.id
                        ? "border-fractal-ocre bg-fractal-ocre/10"
                        : "border-line hover:border-fractal-ocre/50"
                    }`}
                  >
                    <div
                      className="mx-auto mb-2 h-16 w-16 rounded-xl"
                      style={{ background: t.tokens.bg }}
                    />
                    <p className="text-xs font-semibold">{t.name}</p>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={prev}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-line px-5 py-3 text-sm font-medium text-muted hover:bg-soft transition-colors disabled:opacity-40"
                >
                  <ArrowLeft size={16} /> Précédent
                </button>
                <button
                  onClick={next}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-fractal-ocre hover:bg-fractal-terra px-5 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-40"
                >
                  Continuer <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === "Prêt !" && (
            <motion.div
              key="pret"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-3xl border border-line bg-surface p-6 shadow-soft text-center"
            >
              <h1 className="font-display text-3xl font-bold mb-2">🚀 Ta page est prête !</h1>
              <p className="text-sm text-muted mb-6">Tu peux maintenant personnaliser davantage ou commencer à partager.</p>

              <div className="mx-auto mb-6 max-w-xs rounded-2xl border border-line bg-soft p-4">
                <p className="text-xs text-muted mb-1">Ton lien public</p>
                <p className="text-sm font-semibold text-fractal-terra truncate">{publicUrl || "…"}</p>
                <button
                  type="button"
                  onClick={copyUrl}
                  disabled={!publicUrl}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted hover:border-fractal-ocre hover:text-fractal-terra transition-colors disabled:opacity-40"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Copié !" : "Copier le lien"}
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={prev}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-line px-5 py-3 text-sm font-medium text-muted hover:bg-soft transition-colors disabled:opacity-40"
                >
                  <ArrowLeft size={16} /> Précédent
                </button>
                <button
                  onClick={() => complete(false)}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-fractal-ocre hover:bg-fractal-terra px-5 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-40"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Chargement…
                    </>
                  ) : (
                    <>
                      Aller au dashboard <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}