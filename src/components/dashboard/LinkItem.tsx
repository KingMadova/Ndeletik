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
      whileDrag={{ scale: 1.02, boxShadow: "0 10px 30px rgba(193,68,14,.2)" }}
      className="rounded-xl bg-surface border border-line list-none shadow-soft"
    >
      <div className="flex items-center gap-3 px-3 py-3">
        <button
          onPointerDown={(e) => controls.start(e)}
          aria-label="Déplacer"
          className="touch-none cursor-grab active:cursor-grabbing text-muted hover:text-ink transition-colors"
        >
          <GripVertical size={18} />
        </button>

        <span className={`h-9 w-9 rounded-lg ${bg} text-white flex items-center justify-center shrink-0 ${link.is_active ? "" : "opacity-40"}`}>
          <Icon size={17} />
        </span>

        <div className={`flex-1 min-w-0 ${link.is_active ? "" : "opacity-50"}`}>
          <p className="text-sm font-medium text-ink truncate">{link.title}</p>
          <p className="text-xs text-muted truncate">
            {link.clicks} clics · {link.url.replace(/^https?:\/\//, "")}
          </p>
        </div>

        {!link.is_active && (
          <span className="text-xs text-muted px-2 py-0.5 rounded-full bg-soft">Brouillon</span>
        )}

        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Paramètres"
          aria-expanded={open}
          className={`p-1.5 rounded-md hover:bg-soft transition-colors ${open ? "text-fractal-ocre" : "text-muted hover:text-ink"}`}
        >
          <Settings size={16} />
        </button>

        {confirming ? (
          <span className="flex items-center gap-1">
            <button
              onClick={() => onDelete(link.id)}
              aria-label="Confirmer"
              className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => setConfirming(false)}
              aria-label="Annuler"
              className="p-1.5 rounded-md hover:bg-soft text-muted"
            >
              <X size={16} />
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            aria-label="Supprimer"
            className="p-1.5 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
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
            <div className="px-4 pb-4 pt-1 grid gap-3 border-t border-line">
              <label className="grid gap-1 text-xs text-muted">
                Titre
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-fractal-ocre/40"
                />
              </label>
              <label className="grid gap-1 text-xs text-muted">
                URL
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-fractal-ocre/40"
                />
              </label>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={link.is_active}
                    onChange={(e) => onUpdate(link.id, { is_active: e.target.checked })}
                    className="h-4 w-4"
                  />
                  Publié
                </label>
                <button
                  onClick={save}
                  className="rounded-lg bg-yekola-gradient hover:opacity-90 text-white text-sm font-semibold px-4 py-2 shadow-soft transition-all"
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