"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const PRESETS = [
  { label: "Site web", title: "Mon site web", prefix: "" },
  { label: "WhatsApp", title: "Mon WhatsApp", prefix: "wa.me/" },
  { label: "Instagram", title: "Mon Instagram", prefix: "instagram.com/" },
  { label: "TikTok", title: "Mon TikTok", prefix: "tiktok.com/@" },
  { label: "YouTube", title: "Ma chaîne YouTube", prefix: "youtube.com/@" },
  { label: "Email", title: "Me contacter", prefix: "" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (title: string, url: string) => Promise<boolean>;
};

export function AddBlockModal({ open, onClose, onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || busy) return;
    setBusy(true);
    const ok = await onAdd(title.trim(), url.trim());
    setBusy(false);
    if (ok) {
      setTitle("");
      setUrl("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Ajouter un bloc"
            className="w-full max-w-md rounded-2xl bg-surface p-5 shadow-xl border border-line"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-display font-bold text-ink">Ajouter un bloc</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="p-1 rounded-md hover:bg-soft text-muted"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.label}
                  onClick={() => {
                    setTitle(p.title);
                    setUrl(p.prefix);
                  }}
                  className="rounded-full border border-line hover:border-fractal-ocre hover:text-fractal-terra text-xs text-muted px-3 py-1.5 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="grid gap-3">
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre (ex : Mon WhatsApp)"
                className="rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-fractal-ocre"
              />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="URL ou email"
                className="rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-fractal-ocre"
              />
              <button
                type="submit"
                disabled={busy || !title.trim() || !url.trim()}
                className="rounded-xl bg-fractal-ocre hover:bg-fractal-terra disabled:opacity-40 text-white text-sm font-semibold py-3 transition-colors"
              >
                {busy ? "Ajout…" : "Ajouter le bloc"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}