"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

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
        // 1. Créer le compte auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError) throw authError;

        if (authData.user) {
          // 2. Créer le profil associé
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-savane-dark relative overflow-hidden">
      {/* Effet de fond fractal subtil */}
      <div className="absolute top-0 left-0 w-full h-full bg-fractal-gradient opacity-50 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-savane-card border border-savane-border rounded-2xl p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-fractal-ocre/20 text-fractal-ocre mb-4">
            <Sparkles size={24} />
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            {isLogin ? "Bon retour" : "Rejoins Ndeletik"}
          </h1>
          <p className="text-gray-400 text-sm">
            {isLogin ? "Connecte-toi pour gérer tes liens" : "Crée ta page de liens unique en 2 minutes"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nom d'utilisateur (unique)</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-savane-dark border border-savane-border rounded-lg text-white focus:outline-none focus:border-fractal-ocre transition-colors"
                placeholder="ex: konan_officiel"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-savane-dark border border-savane-border rounded-lg text-white focus:outline-none focus:border-fractal-ocre transition-colors"
              placeholder="ton@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-savane-dark border border-savane-border rounded-lg text-white focus:outline-none focus:border-fractal-ocre transition-colors"
              placeholder="••••••••"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-fractal-terra hover:bg-fractal-terra/90 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
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
            className="text-sm text-fractal-ocre hover:text-fractal-or transition-colors"
          >
            {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}