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

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
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

        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;

        if (authData.user) {
          const { error: profileError } = await supabase.from("profiles").insert({
            user_id: authData.user.id,
            slug,
            display_name: slug,
            bio: "Nouveau sur Ndeletik 🌍",
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${slug}`,
          });

          if (profileError) {
            if (profileError.code === "23505") throw new Error("Ce pseudo est déjà pris, choisis-en un autre.");
            if (profileError.message.includes("slug_reserved")) throw new Error("Ce pseudo est réservé.");
            throw profileError;
          }
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue. Réessaie.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 bg-bg border border-line rounded-xl text-ink placeholder:text-muted/70 focus:outline-none focus:border-fractal-ocre transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg relative overflow-hidden">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted hover:text-fractal-terra transition-colors">
        <ArrowLeft size={16} /> Retour à l'accueil
      </Link>

      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-fractal-or/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-surface border border-line rounded-3xl p-8 shadow-soft relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-fractal-or via-fractal-ocre to-fractal-terra mb-4 shadow-soft">
            <Logo className="h-6 w-6 brightness-0 invert" />
          </div>
          <h1 className="text-3xl font-display font-extrabold text-ink mb-2">
            {isLogin ? "Bon retour" : "Rejoins Ndeletik"}
          </h1>
          <p className="text-sm text-muted">
            {isLogin ? "Connecte-toi pour gérer tes liens" : "Crée ta page de liens unique en 2 minutes"}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="mb-4 p-3 bg-fractal-terra/10 border border-fractal-terra/30 rounded-xl text-fractal-terra text-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <label htmlFor="username" className="block text-sm font-medium text-ink mb-1">Nom d'utilisateur (optionnel)</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                minLength={3}
                maxLength={30}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputCls}
                placeholder="ex. alvine-yoka"
              />
              <p className="text-xs text-muted mt-1">3 à 30 caractères : lettres, chiffres ou tirets. Si laissé vide, un pseudo sera généré.</p>
            </motion.div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="ton@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink mb-1">Mot de passe</label>
            <input
              id="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={6}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="••••••••"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-fractal-or via-fractal-ocre to-fractal-terra hover:opacity-90 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                {isLogin ? "Se connecter" : "Créer mon compte"}
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-sm text-fractal-terra hover:text-fractal-ocre transition-colors"
          >
            {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
