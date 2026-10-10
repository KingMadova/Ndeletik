"use client";

import { useState } from "react";
import { Reorder, useDragControls, AnimatePresence, motion } from "framer-motion";
import { GripVertical, Settings, Trash2, Check, X } from "lucide-react";
import type { LinkItem as LinkItemType } from "@/lib/types";
import { getBlockMeta, normalizeUrl } from "./blockMeta";
import { useToast } from "./Toast";

export const validUrl = (v: string) => {
  try {
    const u = new URL(normalizeUrl(v));
    return u.protocol.startsWith("http") || u.protocol === "mailto:" || u.protocol === "tel:";
  } catch {
    return false;
  }
};

type Props = {
  link: LinkItemType;
  onUpdate: (id: string, updates: Partial<LinkItemType>) => void;
  onDelete: (id: string) => void;
  onDragEnd: () => void;
};

export function LinkItem({ link, onUpdate, onDelete, onDragEnd }: Props) {
  const controls = useDragControls();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const { Icon, bg } = getBlockMeta(link.url);

  const save = () => {
    if (!title.trim() || !url.trim()) {
      toast("Titre et URL sont requis", false);
      return;
    }
    if (!validUrl(url)) {
      toast("URL invalide (ex : https://wa.me/…)", false);
      return;
    }
    onUpdate(link.id, { title: title.trim(), url: normalizeUrl(url) });
    setOpen(false);
  };

  return (
    <Reorder.Item
      value={link}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.02, boxShadow: "0 10px 30px rgba(193,68,14,.18)" }}
      className="rounded-2xl bg-surface border border-line list-none shadow-soft"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onPointerDown={(e) => controls.start(e)}
          aria-label="Déplacer"
          className="touch-none cursor-grab active:cursor-grabbing text-line hover:text-muted transition-colors"
        >
          <GripVertical size={18} />
        </button>

        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg} text-white shadow-soft ${
            link.enabled ? "" : "opacity-40"
          }`}
        >
          <Icon size={18} />
        </span>

        <div className={`flex-1 min-w-0 ${link.enabled ? "" : "opacity-50"}`}>
          <p className="text-sm font-semibold text-ink truncate">{link.title}</p>
          <p className="text-xs text-muted truncate">
            {link.clicks} clics · {link.url.replace(/^https?:\/\//, "")}
          </p>
        </div>

        {!link.enabled && (
          <span className="text-xs text-muted bg-soft px-2 py-1 rounded-full">Brouillon</span>
        )}

        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Paramètres"
          aria-expanded={open}
          className={`p-2 rounded-lg transition-colors ${
            open ? "bg-fractal-ocre/10 text-fractal-ocre" : "hover:bg-soft text-muted"
          }`}
        >
          <Settings size={16} />
        </button>

        {confirming ? (
          <span className="flex items-center gap-1">
            <button
              onClick={() => onDelete(link.id)}
              aria-label="Confirmer"
              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => setConfirming(false)}
              aria-label="Annuler"
              className="p-2 rounded-lg hover:bg-soft text-muted transition-colors"
            >
              <X size={16} />
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            aria-label="Supprimer"
            className="p-2 rounded-lg hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-3 grid gap-3 border-t border-line bg-soft/30">
              <label className="block">
                <span className="text-xs text-muted mb-1.5 block">Titre</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-fractal-ocre transition-colors"
                />
              </label>
              <label className="block">
                <span className="text-xs text-muted mb-1.5 block">URL</span>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-fractal-ocre transition-colors"
                />
              </label>
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={link.enabled}
                    onChange={(e) => onUpdate(link.id, { enabled: e.target.checked })}
                    className="h-4 w-4 accent-fractal-ocre rounded"
                  />
                  Publié
                </label>
                <button
                  onClick={save}
                  className="rounded-xl bg-fractal-ocre hover:bg-fractal-terra text-white text-sm font-semibold px-5 py-2.5 transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
}