"use client";

<<<<<<< HEAD
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
=======
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
>>>>>>> origin/master
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
<<<<<<< HEAD
  const [success, setSuccess] = useState("");
  const router = useRouter();

  // Le lien « Connexion » de la landing page ouvre explicitement le mode connexion.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "login") setIsLogin(true);
    if (params.get("mode") === "signup") setIsLogin(false);
  }, []);

  const generateSlug = (email: string): string => {
    const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    const suffix = Math.random().toString(36).substring(2, 6);
    return `${base}${suffix}`;
=======
  const [info, setInfo] = useState("");
  const plan = params.get("plan");

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
>>>>>>> origin/master
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
<<<<<<< HEAD
    setSuccess("");

=======
    setInfo("");
>>>>>>> origin/master
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) {
          if (error.message.toLowerCase().includes("invalid login credentials")) {
            throw new Error("Adresse e-mail ou mot de passe incorrect. Vérifiez vos identifiants puis réessayez.");
          }
          if (error.message.toLowerCase().includes("email not confirmed")) {
            throw new Error("Votre adresse e-mail n’est pas encore confirmée. Consultez votre boîte de réception.");
          }
          if (error.message.toLowerCase().includes("too many requests")) {
            throw new Error("Trop de tentatives. Patientez quelques minutes avant de réessayer.");
          }
          throw new Error("La connexion est momentanément impossible. Vérifiez votre connexion Internet puis réessayez.");
        }
      } else {
<<<<<<< HEAD
        const rawSlug = username.trim() || generateSlug(email);
        const slug = rawSlug
          .normalize("NFKD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");

        if (slug.length < 3) {
          throw new Error("Votre pseudo doit contenir au moins 3 caractères (lettres, chiffres ou tirets).");
        }
        if (slug.length > 30) {
          throw new Error("Votre pseudo ne peut pas dépasser 30 caractères.");
        }
        if (isReserved(slug)) throw new Error("Ce nom d'utilisateur est réservé.");

        const { data: authData, error: authError } = await supabase.auth.signUp({ email: email.trim(), password });
        if (authError) {
          const message = authError.message.toLowerCase();
          if (message.includes("already registered") || message.includes("already exists")) {
            throw new Error("Un compte existe déjà avec cette adresse e-mail. Connectez-vous ou utilisez une autre adresse.");
          }
          if (message.includes("password")) {
            throw new Error("Le mot de passe ne respecte pas les exigences de sécurité. Choisissez-en un autre.");
          }
          if (message.includes("rate limit") || message.includes("too many requests")) {
            throw new Error("Trop de tentatives d’inscription. Patientez quelques minutes avant de réessayer.");
          }
          throw new Error("La création du compte a échoué. Vérifiez les informations saisies puis réessayez.");
        }

        // Avec la confirmation d'e-mail activée, Supabase ne fournit pas encore de session.
        // On évite d'effectuer une insertion protégée par RLS avant la confirmation.
        if (authData.user && !authData.session) {
          setSuccess("Votre compte a été créé. Consultez votre boîte e-mail pour confirmer votre adresse, puis connectez-vous.");
          return;
        }

        if (authData.user) {
          const { error: profileError } = await supabase.from("profiles").insert({
            user_id: authData.user.id,
=======
        const slug = username.trim().toLowerCase().replace(/\s+/g, "") || generateSlug(email);
        if (isReserved(slug)) throw new Error("Ce pseudo est réservé.");
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          const { error: pe } = await supabase.from("profiles").insert({
            user_id: data.user.id,
>>>>>>> origin/master
            slug,
            display_name: slug,
            bio: "Nouveau sur Ndeletik 🌍",
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${slug}`,
          });
<<<<<<< HEAD

          if (profileError) {
            if (profileError.code === "23505") throw new Error("Ce pseudo est déjà pris. Choisissez-en un autre.");
            if (profileError.message.includes("slug_reserved")) throw new Error("Ce pseudo est réservé.");
            throw new Error("Votre compte a été créé, mais votre profil n’a pas pu être initialisé. Connectez-vous et réessayez. Si le problème persiste, contactez l’assistance.");
          }
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue. Réessayez dans quelques instants.");
=======
          if (pe) {
            if (pe.code === "23505") throw new Error("Ce pseudo est déjà pris, choisis-en un autre.");
            if (pe.message.includes("slug_reserved")) throw new Error("Ce pseudo est réservé.");
            throw pe;
          }
        }
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(fr(err.message));
>>>>>>> origin/master
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const inputCls = "w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 pl-11 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-rose-400/80 focus:bg-white/[0.09] focus:ring-2 focus:ring-rose-400/20";

  return (
    <main className="auth-experience relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 text-white">
      <div aria-hidden className="auth-glow auth-glow-one" />
      <div aria-hidden className="auth-glow auth-glow-two" />
      <Link href="/" className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white sm:left-8 sm:top-8">
        <ArrowLeft size={16} /> Accueil
      </Link>

      <motion.section
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="auth-panel relative z-10 w-full max-w-md rounded-[30px] border border-white/10 p-6 shadow-2xl sm:p-9"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] shadow-lg">
            <Logo className="h-7 w-7" />
          </div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-300">Votre présence, partout</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {isLogin ? "Heureux de vous revoir" : "Créer un compte"}
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-white/55">
            {isLogin ? "Connectez-vous pour gérer votre page Ndeletik." : "Créez votre page et rassemblez vos liens en un seul endroit."}
=======
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
>>>>>>> origin/master
          </p>
          {plan && !resetMode && (
            <span className="mt-2 inline-block rounded-full bg-fractal-ocre/10 px-3 py-1 text-xs font-semibold text-fractal-terra">
              Plan {plan} sélectionné
            </span>
          )}
        </div>

        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} role="status"
            className="mb-5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm leading-5 text-emerald-100">
            {success}
          </motion.div>
        )}

        {error && (
<<<<<<< HEAD
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} role="alert"
            className="mb-5 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm leading-5 text-rose-100">
=======
          <div className="mb-4 p-3 bg-fractal-terra/10 border border-fractal-terra/30 rounded-xl text-fractal-terra text-sm">
>>>>>>> origin/master
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
            {info}
          </div>
        )}

<<<<<<< HEAD
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLogin && (
            <div className="relative">
              <label htmlFor="username" className="mb-1.5 block text-xs font-medium text-white/70">Nom d'utilisateur (facultatif)</label>
              <input id="username" type="text" autoComplete="username" minLength={3} maxLength={30} value={username}
                onChange={(e) => setUsername(e.target.value)} className={inputCls} placeholder="ex. alvine-yoka" />
              <p className="mt-1.5 text-xs leading-5 text-white/40">3 à 30 caractères : lettres, chiffres ou tirets.</p>
            </div>
          )}
          <div className="relative">
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-white/70">Adresse e-mail</label>
            <span className="pointer-events-none absolute left-4 top-[42px] text-white/40"><span aria-hidden>✉</span></span>
            <input id="email" type="email" autoComplete="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="vous@exemple.com" />
          </div>
          <div className="relative">
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-white/70">Mot de passe</label>
            <span className="pointer-events-none absolute left-4 top-[42px] text-white/40"><span aria-hidden>♙</span></span>
            <input id="password" type="password" autoComplete={isLogin ? "current-password" : "new-password"} minLength={6} required
              value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="Au moins 6 caractères" />
          </div>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.985 }} type="submit" disabled={loading}
            className="auth-primary mt-3 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition disabled:cursor-wait disabled:opacity-60">
            {loading ? <><Loader2 size={17} className="animate-spin" /> Chargement...</> : <>{isLogin ? "Continuer avec e-mail" : "Créer mon compte"} <ArrowRight size={17} /></>}
          </motion.button>
        </form>

        <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-white/30">
          <span className="h-px flex-1 bg-white/10" /> Accès sécurisé <span className="h-px flex-1 bg-white/10" />
        </div>
        <p className="text-center text-sm text-white/55">
          {isLogin ? "Pas encore de compte ?" : "Vous avez déjà un compte ?"}{" "}
          <button type="button" onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }}
            className="font-semibold text-rose-300 transition hover:text-rose-200">
            {isLogin ? "S'inscrire" : "Se connecter"}
          </button>
        </p>
        <p className="mt-7 text-center text-[11px] text-white/30">En continuant, vous acceptez d'utiliser Ndeletik de manière responsable.</p>
      </motion.section>
    </main>
=======
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
>>>>>>> origin/master
  );
}
