"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, Mail, Smartphone } from "lucide-react";
import { FaGoogle } from "react-icons/fa6";
import { supabase } from "@/lib/supabaseClient";
import { Logo } from "@/components/landing/ui";
import { isReserved } from "@/lib/reserved";

type Method = "password" | "magic" | "sms";

const FRENCH_ERRORS: [RegExp, string][] = [
  [/invalid login credentials/i, "Email ou mot de passe incorrect."],
  [/email not confirmed/i, "Confirme d'abord ton adresse email (voir ta boîte mail)."],
  [/user already registered/i, "Un compte existe déjà avec cet email."],
  [/phone number .* invalid|invalid phone/i, "Numéro invalide. Format international : +242…"],
  [/provider is not enabled|sms provider/i, "Connexion par SMS non activée pour le moment."],
  [/token has expired/i, "Ce code a expiré. Demande un nouveau."],
  [/invalid otp/i, "Code invalide. Vérifie les 6 chiffres."],
  [/rate limit/i, "Trop de tentatives. Attends une minute."],
  [/password should be/i, "Mot de passe : 6 caractères minimum."],
];
const fr = (msg: string) => FRENCH_ERRORS.find(([re]) => re.test(msg))?.[1] ?? msg;
const digits = (v: string) => v.replace(/[^\d+]/g, "");

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthInner />
    </Suspense>
  );
}

function AuthInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [method, setMethod] = useState<Method>("password");
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [username, setUsername] = useState(params.get("slug") ?? "");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const plan = params.get("plan");

  useEffect(() => {
    const mode = params.get("mode");
    if (mode === "login") setIsLogin(true);
    if (mode === "signup") setIsLogin(false);
  }, [params]);

  /* Profil manquant (connexion Google / OAuth) : création automatique. */
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: rows } = await supabase.from("profiles").select("id").eq("user_id", session.user.id);
      if ((rows ?? []).length === 0) {
        const base =
          (session.user.email ?? "user").split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20) || "user";
        let slug = base;
        let i = 0;
        for (;;) {
          const taken = isReserved(slug);
          const { data: existing } = await supabase.from("profiles").select("id").eq("slug", slug).maybeSingle();
          if (!taken && !existing) break;
          slug = `${base}${++i}`;
        }
        await supabase.from("profiles").insert({
          user_id: session.user.id,
          slug,
          display_name: session.user.user_metadata?.full_name ?? slug,
          bio: "Nouveau sur Ndeletik 🌍",
          avatar_url:
            session.user.user_metadata?.avatar_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${slug}`,
        });
      }
      if (params.get("reset") === "1") setResetMode(true);
    })();
  }, [params]);

  const generateSlug = (mail: string) => {
    const base = mail.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    return `${base}${Math.random().toString(36).substring(2, 6)}`;
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const slug = username.trim().toLowerCase().replace(/\s+/g, "") || generateSlug(email);
        if (isReserved(slug)) throw new Error("Ce pseudo est réservé.");
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Avec la confirmation email activée, Supabase peut créer l'utilisateur sans session.
        // Dans ce cas, ne pas tenter une insertion de profil protégée par RLS.
        if (data.user && !data.session) {
          setInfo("Votre compte a été créé. Consultez votre boîte e-mail pour confirmer votre adresse, puis connectez-vous.");
          return;
        }
        if (data.user && data.session) {
          const { error: pe } = await supabase.from("profiles").insert({
            user_id: data.user.id,
            slug,
            display_name: slug,
            bio: "Nouveau sur Ndeletik 🌍",
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${slug}`,
          });
          if (pe) {
            if (pe.code === "23505") throw new Error("Ce pseudo est déjà pris, choisis-en un autre.");
            if (pe.message.includes("slug_reserved")) throw new Error("Ce pseudo est réservé.");
            throw pe;
          }
        }
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue. Réessayez dans quelques instants.";
      setError(fr(message));
    } finally {
      setLoading(false);
    }
  };

  const submitMagic = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setLoading(false);
    if (error) setError(fr(error.message));
    else setInfo("Lien de connexion envoyé ! Ouvre tes emails.");
  };

  const submitSms = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    const { error } = await supabase.auth.signInWithOtp({ phone: digits(phone) });
    setLoading(false);
    if (error) setError(fr(error.message));
    else {
      setOtpSent(true);
      setInfo("Code envoyé par SMS.");
    }
  };

  const verifySms = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.verifyOtp({ phone: digits(phone), token: otpCode, type: "sms" });
    setLoading(false);
    if (error) setError(fr(error.message));
    else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const google = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth` },
    });
    if (error) setError(fr(error.message));
  };

  const forgot = async () => {
    setLoading(true);
    setError("");
    setInfo("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?reset=1`,
    });
    setLoading(false);
    if (error) setError(fr(error.message));
    else setInfo("Email de réinitialisation envoyé. Suis le lien.");
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) setError(fr(error.message));
    else {
      setInfo("Mot de passe mis à jour.");
      router.push("/dashboard");
      router.refresh();
    }
  };

  const inputCls =
    "w-full px-4 py-3 bg-bg border border-line rounded-xl text-ink placeholder:text-muted/70 focus:outline-none focus:border-fractal-ocre transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg relative overflow-hidden">
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted hover:text-fractal-terra transition-colors"
      >
        <ArrowLeft size={16} /> Retour à l&apos;accueil
      </Link>
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-fractal-or/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-surface border border-line rounded-3xl p-8 shadow-soft relative z-10"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-fractal-or via-fractal-ocre to-fractal-terra mb-4 shadow-soft">
            <Logo className="h-6 w-6 brightness-0 invert" />
          </div>
          <h1 className="text-3xl font-display font-extrabold text-ink mb-2">
            {resetMode ? "Nouveau mot de passe" : isLogin && method === "password" ? "Bon retour" : "Rejoins Ndeletik"}
          </h1>
          <p className="text-sm text-muted">
            {resetMode
              ? "Choisis un nouveau mot de passe."
              : "Ta page de liens unique, en 2 minutes."}
          </p>
          {plan && !resetMode && (
            <span className="mt-2 inline-block rounded-full bg-fractal-ocre/10 px-3 py-1 text-xs font-semibold text-fractal-terra">
              Plan {plan} sélectionné
            </span>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-fractal-terra/10 border border-fractal-terra/30 rounded-xl text-fractal-terra text-sm">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
            {info}
          </div>
        )}

        {resetMode ? (
          <form onSubmit={submitReset} className="space-y-4">
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputCls}
              placeholder="Nouveau mot de passe"
              autoComplete="new-password"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-fractal-or via-fractal-ocre to-fractal-terra text-white font-semibold rounded-xl disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="mx-auto animate-spin" /> : "Mettre à jour"}
            </button>
          </form>
        ) : (
          <>
            {/* Sélecteur de méthode */}
            <div className="mb-5 grid grid-cols-3 gap-1 rounded-full bg-soft p-1 text-xs font-medium" role="tablist">
              {(
                [
                  ["password", "Mot de passe", KeyRound],
                  ["magic", "Lien email", Mail],
                  ["sms", "Code SMS", Smartphone],
                ] as [Method, string, any][]
              ).map(([m, label, Icon]) => (
                <button
                  key={m}
                  role="tab"
                  aria-selected={method === m}
                  onClick={() => {
                    setMethod(m);
                    setError("");
                    setInfo("");
                    setOtpSent(false);
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-full py-2 transition ${
                    method === m ? "bg-surface text-ink shadow-soft" : "text-muted hover:text-ink"
                  }`}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>

            {method === "password" && (
              <form onSubmit={submitPassword} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Nom d&apos;utilisateur (optionnel)</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={inputCls}
                      placeholder="Laisser vide = généré automatiquement"
                      autoComplete="username"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                    placeholder="ton@email.com"
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Mot de passe</label>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputCls} pr-11`}
                      placeholder="••••••••"
                      autoComplete={isLogin ? "current-password" : "new-password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {isLogin && (
                  <button
                    type="button"
                    onClick={forgot}
                    className="text-xs text-fractal-terra hover:text-fractal-ocre transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-fractal-or via-fractal-ocre to-fractal-terra text-white font-semibold rounded-xl disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="mx-auto animate-spin" /> : isLogin ? "Se connecter" : "Créer mon compte"}
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsLogin((v) => !v)}
                    className="text-sm text-fractal-terra hover:text-fractal-ocre transition-colors"
                  >
                    {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                  </button>
                </div>
              </form>
            )}

            {method === "magic" && (
              <form onSubmit={submitMagic} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                    placeholder="ton@email.com"
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-fractal-or via-fractal-ocre to-fractal-terra text-white font-semibold rounded-xl disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="mx-auto animate-spin" /> : "Recevoir le lien de connexion"}
                </button>
                <p className="text-xs text-muted text-center">Sans mot de passe : un clic dans ton email et tu es connecté.</p>
              </form>
            )}

            {method === "sms" && (
              <form onSubmit={otpSent ? verifySms : submitSms} className="space-y-4">
                {!otpSent ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1">Numéro de téléphone</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={inputCls}
                        placeholder="+242 06 000 00 00"
                        autoComplete="tel"
                        inputMode="tel"
                      />
                      <p className="text-xs text-muted mt-1">Format international. Un code à 6 chiffres sera envoyé.</p>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-fractal-or via-fractal-ocre to-fractal-terra text-white font-semibold rounded-xl disabled:opacity-50"
                    >
                      {loading ? <Loader2 size={18} className="mx-auto animate-spin" /> : "Recevoir le code"}
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1">Code à 6 chiffres</label>
                      <input
                        type="text"
                        required
                        inputMode="numeric"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        className={`${inputCls} text-center text-2xl tracking-[0.5em]`}
                        placeholder="000000"
                        autoComplete="one-time-code"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || otpCode.length !== 6}
                      className="w-full py-3 bg-gradient-to-r from-fractal-or via-fractal-ocre to-fractal-terra text-white font-semibold rounded-xl disabled:opacity-50"
                    >
                      {loading ? <Loader2 size={18} className="mx-auto animate-spin" /> : "Vérifier et entrer"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="w-full text-xs text-muted hover:text-ink transition-colors"
                    >
                      Changer de numéro
                    </button>
                  </>
                )}
              </form>
            )}

            <div className="my-5 flex items-center gap-3 text-xs text-muted">
              <span className="h-px flex-1 bg-line" /> ou <span className="h-px flex-1 bg-line" />
            </div>
            <button
              type="button"
              onClick={google}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-line bg-surface text-sm font-semibold text-ink hover:border-fractal-ocre transition-colors"
            >
              <FaGoogle size={16} /> Continuer avec Google
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}