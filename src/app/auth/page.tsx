"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Logo } from "@/components/landing/ui";
import { isReserved } from "@/lib/reserved";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

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
            slug,
            display_name: slug,
            bio: "Nouveau sur Ndeletik 🌍",
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${slug}`,
          });

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
    } finally {
      setLoading(false);
    }
  };

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
          </p>
        </div>

        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} role="status"
            className="mb-5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm leading-5 text-emerald-100">
            {success}
          </motion.div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} role="alert"
            className="mb-5 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm leading-5 text-rose-100">
            {error}
          </motion.div>
        )}

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
  );
}
