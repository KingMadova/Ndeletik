"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Plus, Link as LinkIcon, Trash2, ExternalLink } from "lucide-react";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  display_order: number;
  clicks: number;
}

export default function Dashboard() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/auth");
      return;
    }
    fetchLinks(session.user.id);
  };

  const fetchLinks = async (userId: string) => {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("user_id", userId)
      .order("display_order", { ascending: true });
    
    if (!error && data) setLinks(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const addLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("links").insert({
      user_id: session.user.id,
      title: newTitle,
      url: newUrl.startsWith("http") ? newUrl : `https://${newUrl}`,
      display_order: links.length,
    });

    if (!error) {
      setNewTitle("");
      setNewUrl("");
      fetchLinks(session.user.id);
    }
  };

  const deleteLink = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.from("links").delete().eq("id", id);
    fetchLinks(session.user.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-savane-dark flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-fractal-ocre border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-savane-dark text-white">
      {/* Header */}
      <header className="border-b border-savane-border bg-savane-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-display font-bold text-fractal-ocre">Ndeletik</h1>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Formulaire d'ajout */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-savane-card border border-savane-border rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus size={20} className="text-fractal-terra" /> Ajouter un nouveau lien
          </h2>
          <form onSubmit={addLink} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <input
              type="text"
              placeholder="Titre (ex: Mon WhatsApp)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="md:col-span-4 px-4 py-3 bg-savane-dark border border-savane-border rounded-lg text-white focus:outline-none focus:border-fractal-ocre"
            />
            <input
              type="text"
              placeholder="URL (ex: wa.me/229...)"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="md:col-span-6 px-4 py-3 bg-savane-dark border border-savane-border rounded-lg text-white focus:outline-none focus:border-fractal-ocre"
            />
            <button
              type="submit"
              className="md:col-span-2 bg-fractal-terra hover:bg-fractal-terra/90 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Ajouter
            </button>
          </form>
        </motion.div>

        {/* Liste des liens */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-300">Tes liens actifs</h2>
          <AnimatePresence>
            {links.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-savane-card/30 rounded-xl border border-dashed border-savane-border"
              >
                <LinkIcon size={48} className="mx-auto text-gray-600 mb-3" />
                <p className="text-gray-500">Aucun lien pour le moment. Ajoute ton premier lien ci-dessus !</p>
              </motion.div>
            ) : (
              links.map((link, index) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-savane-card border border-savane-border rounded-xl p-4 flex items-center justify-between hover:border-fractal-ocre/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-savane-dark flex items-center justify-center text-fractal-or font-bold">
                      {link.title.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{link.title}</h3>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-fractal-ocre flex items-center gap-1">
                        {link.url} <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 bg-savane-dark px-3 py-1 rounded-full">
                      {link.clicks} clics
                    </span>
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}