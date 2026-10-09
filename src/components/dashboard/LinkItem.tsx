"use client";

import { useState } from "react";
import { Reorder, useDragControls, AnimatePresence, motion } from "framer-motion";
import { GripVertical, Settings, Trash2, Check, X } from "lucide-react";
import type { LinkItem as LinkItemType } from "@/lib/types";
import { getBlockMeta, normalizeUrl } from "./blockMeta";

type Props = {
  link: LinkItemType;
  onUpdate: (id: string, updates: Partial<LinkItemType>) => void;
  onDelete: (id: string) => void;
  onDragEnd: () => void;
};

export function LinkItem({ link, onUpdate, onDelete, onDragEnd }: Props) {
  const controls = useDragControls();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const { Icon, bg } = getBlockMeta(link.url);

  const save = () => {
    if (!title.trim() || !url.trim()) return;
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
        {/* Poignée de drag */}
        <button
          onPointerDown={(e) => controls.start(e)}
          aria-label="Déplacer"
          className="touch-none cursor-grab active:cursor-grabbing text-line hover:text-muted transition-colors"
        >
          <GripVertical size={18} />
        </button>

        {/* Icône de l'app */}
        <span
          className={`h-10 w-10 rounded-xl ${bg} text-white flex items-center justify-center shrink-0 shadow-soft ${
            link.is_active ? "" : "opacity-40"
          }`}
        >
          <Icon size={18} />
        </span>

        {/* Contenu */}
        <div className={`flex-1 min-w-0 ${link.is_active ? "" : "opacity-50"}`}>
          <p className="text-sm font-semibold text-ink truncate">{link.title}</p>
          <p className="text-xs text-muted truncate">
            {link.clicks} clics · {link.url.replace(/^https?:\/\//, "")}
          </p>
        </div>

        {/* Badge brouillon */}
        {!link.is_active && (
          <span className="text-xs text-muted bg-soft px-2 py-1 rounded-full">Brouillon</span>
        )}

        {/* Bouton paramètres */}
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

        {/* Bouton supprimer */}
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

      {/* Panneau d'édition */}
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
                    checked={link.is_active}
                    onChange={(e) => onUpdate(link.id, { is_active: e.target.checked })}
                    className="h-4 w-4 accent-fractal-ocre rounded"
                  />
                  Publié
                </label>
                <button
                  onClick={save}
                  className="rounded-xl bg-gradient-to-r from-fractal-or via-fractal-ocre to-fractal-terra hover:opacity-90 text-white text-sm font-semibold px-5 py-2.5 transition"
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