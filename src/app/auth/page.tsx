"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Logo } from "@/components/landing/ui";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError) throw authError;

        if (authData.user) {
          const { error: profileError } = await supabase.from("profiles").insert({
            id: authData.user.id,
            username: username.toLowerCase().replace(/\s+/g, ""),
            bio: "Nouveau sur Ndeletik 🌍",
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          });
          if (profileError) throw profileError;
        }
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-fractal-or via-fractal-ocre to-fractal-terra mb-4 shadow-soft">
            <Logo className="h-6 w-6 brightness-0 invert" />
          </div>
          <h1 className="text-3xl font-display font-extrabold text-ink mb-2">
            {isLogin ? "Bon retour" : "Rejoins Ndeletik"}
          </h1>
          <p className="text-sm text-muted">
            {isLogin
              ? "Connecte-toi pour gérer tes liens"
              : "Crée ta page de liens unique en 2 minutes"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-fractal-terra/10 border border-fractal-terra/30 rounded-xl text-fractal-terra text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Nom d&apos;utilisateur (unique)
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputCls}
                placeholder="ex: konan_officiel"
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Mot de passe
            </label>
            <input
              type="password"
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
            {loading ? "Chargement..." : isLogin ? "Se connecter" : "Créer mon compte"}
            {!loading && <ArrowRight size={18} />}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-sm text-fractal-terra hover:text-fractal-ocre transition-colors"
          >
            {isLogin
              ? "Pas encore de compte ? S'inscrire"
              : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}