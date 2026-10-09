"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Link2, Copy, QrCode, Trash2, X, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "./Toast";

type ShortLink = {
  id: string;
  slug: string;
  target_url: string;
  clicks: number;
  is_active: boolean;
  created_at: string;
};

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{2,29}$/;
const QUOTAS: Record<string, number> = { free: 3, pro: Infinity, business: Infinity };

type Props = { userId: string; plan: string };

export function ShortLinkManager({ userId, plan }: Props) {
  const { toast, node: toastNode } = useToast();
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [slug, setSlug] = useState("");
  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState(false);
  const [qrSlug, setQrSlug] = useState<string | null>(null);

  const quota = QUOTAS[plan] ?? QUOTAS.free;
  const atLimit = links.length >= quota;
  const remaining = quota === Infinity ? Infinity : Math.max(0, quota - links.length);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("short_links")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setLinks((data as ShortLink[]) ?? []);
      setLoading(false);
    })();
  }, [userId]);

  const fullUrl = (s: string) =>
    typeof window !== "undefined" ? `${window.location.origin}/go/${s}` : `/go/${s}`;

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!SLUG_REGEX.test(slug)) {
      return toast("Alias invalide : 3 à 30 caractères (a-z, 0-9, -)", false);
    }
    if (!target.trim()) return toast("URL cible requise", false);

    setBusy(true);
    const { data, error } = await supabase
      .from("short_links")
      .insert({ user_id: userId, slug: slug.trim().toLowerCase(), target_url: target.trim() })
      .select()
      .single();
    setBusy(false);

    if (error) {
      if (error.code === "23505") toast("Cet alias est déjà pris, essaie un autre", false);
      else toast(`Échec : ${error.message}`, false);
      return;
    }

    setLinks((prev) => [data as ShortLink, ...prev]);
    setSlug("");
    setTarget("");
    setShowForm(false);
    toast("Raccourci créé !");
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce raccourci ?")) return;
    const { error } = await supabase.from("short_links").delete().eq("id", id);
    if (error) return toast("Suppression échouée", false);
    setLinks((prev) => prev.filter((l) => l.id !== id));
    toast("Raccourci supprimé");
  };

  const copy = async (s: string) => {
    try {
      await navigator.clipboard.writeText(fullUrl(s));
      toast("Lien copié !");
    } catch {
      toast("Copie impossible", false);
    }
  };

  const randomSlug = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let out = "";
    for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
    setSlug(out);
  };

  const inputCls =
    "w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-fractal-ocre transition-colors";

  return (
    <div className="bg-soft rounded-2xl p-5 border border-line">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <Sparkles size={14} className="text-fractal-ocre" /> Raccourcis Ndeletik
          </h3>
          <p className="text-xs text-muted mt-0.5">
            {atLimit ? (
              <span className="text-fractal-terra">
                Limite atteinte ({quota}) — passe au plan Pro pour des raccourcis illimités
              </span>
            ) : (
              <>
                {links.length} raccourci{links.length > 1 ? "s" : ""} ·{" "}
                {remaining === Infinity ? "illimité" : `${remaining} restant${remaining > 1 ? "s" : ""}`}
              </>
            )}
          </p>
        </div>
        {!atLimit && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-fractal-ocre hover:bg-fractal-terra text-white text-xs font-semibold px-3 py-2 transition-colors"
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? "Annuler" : "Nouveau"}
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {showForm && (
          <motion.form
            onSubmit={create}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="grid gap-3 pb-4 border-b border-line">
              <div>
                <label className="text-xs text-muted mb-1.5 block">Alias (slug)</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 rounded-xl border border-line bg-bg px-3 py-2.5">
                    <span className="text-xs text-muted whitespace-nowrap">ndeletik.com/go/</span>
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      placeholder="commande"
                      className="flex-1 bg-transparent text-sm text-ink focus:outline-none min-w-0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={randomSlug}
                    className="shrink-0 rounded-xl border border-line px-3 text-xs text-muted hover:border-fractal-ocre hover:text-fractal-terra transition-colors"
                    title="Générer un alias aléatoire"
                  >
                    🎲
                  </button>
                </div>
                <p className="text-[10px] text-muted mt-1">3 à 30 caractères : lettres minuscules, chiffres, tirets.</p>
              </div>
              <div>
                <label className="text-xs text-muted mb-1.5 block">URL cible</label>
                <input
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="https://wa.me/242..."
                  className={inputCls}
                />
              </div>
              <button
                type="submit"
                disabled={busy || !slug || !target}
                className="rounded-xl bg-fractal-ocre hover:bg-fractal-terra disabled:opacity-40 text-white text-sm font-semibold py-2.5 transition-colors"
              >
                {busy ? "Création…" : "Créer le raccourci"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-line/50 animate-pulse" />
          ))}
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-8 rounded-xl border border-dashed border-line">
          <Link2 size={28} className="mx-auto text-line mb-2" />
          <p className="text-xs text-muted">Aucun raccourci pour le moment.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {links.map((l) => (
            <li key={l.id} className="flex items-center gap-3 rounded-xl bg-surface border border-line p-3">
              <div className="min-w-0 flex-1">
                <a
                  href={fullUrl(l.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-ink hover:text-fractal-terra transition-colors truncate block"
                >
                  /go/{l.slug}
                </a>
                <p className="text-[11px] text-muted truncate">{l.target_url}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-fractal-ocre">{l.clicks}</div>
                <div className="text-[10px] text-muted">clics</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => copy(l.slug)}
                  aria-label="Copier"
                  className="p-1.5 rounded-md hover:bg-soft text-muted hover:text-fractal-ocre transition-colors"
                >
                  <Copy size={14} />
                </button>
                <button
                  onClick={() => setQrSlug(l.slug)}
                  aria-label="QR code"
                  className="p-1.5 rounded-md hover:bg-soft text-muted hover:text-fractal-ocre transition-colors"
                >
                  <QrCode size={14} />
                </button>
                <button
                  onClick={() => remove(l.id)}
                  aria-label="Supprimer"
                  className="p-1.5 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {qrSlug && <QrModal slug={qrSlug} onClose={() => setQrSlug(null)} />}
      {toastNode}
    </div>
  );
}

function QrModal({ slug, onClose }: { slug: string; onClose: () => void }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { toDataURL } = await import("qrcode");
        const url =
          typeof window !== "undefined"
            ? `${window.location.origin}/go/${slug}`
            : `/go/${slug}`;
        const data = await toDataURL(url, {
          margin: 2,
          width: 400,
          color: { dark: "#18181B", light: "#FFF9F3" },
        });
        setDataUrl(data);
      } catch {
        setError(true);
      }
    })();
  }, [slug]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={onClose}>
      <div
        className="bg-surface rounded-2xl p-6 border border-line shadow-xl max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold">QR Code</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-soft text-muted" aria-label="Fermer">
            <X size={16} />
          </button>
        </div>
        <div className="aspect-square bg-surface rounded-xl border border-line p-4 flex items-center justify-center mb-3">
          {error ? (
            <p className="text-sm text-muted text-center">Impossible de générer le QR code</p>
          ) : dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt={`QR code ndeletik.com/go/${slug}`} className="w-full h-full" />
          ) : (
            <div className="w-full h-full rounded-xl bg-soft animate-pulse" />
          )}
        </div>
        <p className="text-xs text-muted text-center mb-4">ndeletik.com/go/{slug}</p>
        <a
          href={dataUrl ?? "#"}
          download={`qr-${slug}.png`}
          className={`block w-full text-center rounded-xl bg-fractal-ocre hover:bg-fractal-terra text-white text-sm font-semibold py-2.5 transition-colors ${
            !dataUrl ? "pointer-events-none opacity-40" : ""
          }`}
        >
          Télécharger le QR
        </a>
      </div>
    </div>
  );
}