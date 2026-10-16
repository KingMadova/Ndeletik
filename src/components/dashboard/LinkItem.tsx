"use client";

import { useState } from "react";
import { Reorder, useDragControls, AnimatePresence, motion } from "framer-motion";
import { BarChart3, GripVertical, Settings2, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import type { DbLink } from "@/lib/dashboard-types";
import { detectIcon } from "@/lib/detect-icon";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Field, Switch, inputClass } from "@/components/ui/Field";
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
  link: DbLink;
  onUpdate: (id: string, updates: Partial<DbLink>) => void;
  onDelete: (id: string) => void;
  onDragEnd: () => void;
  onShowAnalytics?: (link: DbLink) => void;
};

export function LinkItem({ link, onUpdate, onDelete, onDragEnd, onShowAnalytics }: Props) {
  const controls = useDragControls();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const { Icon, bg } = getBlockMeta(link.url);

  const save = () => {
    if (!title.trim() || !url.trim()) return toast("Le titre et l'adresse sont requis", false);
    if (!validUrl(url)) return toast("Adresse invalide (ex : https://wa.me/…)", false);
    const clean = normalizeUrl(url);
    // L'icône est détectée une seule fois, à l'enregistrement (et non à chaque touche).
    onUpdate(link.id, { title: title.trim(), url: clean, icon: detectIcon(clean) });
    setOpen(false);
  };

  return (
    <Reorder.Item
      value={link}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.02, boxShadow: "0 10px 30px rgba(193,68,14,.18)" }}
      className="list-none rounded-2xl border border-line bg-surface shadow-soft"
    >
      <div className="flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4">
        <button
          type="button"
          onPointerDown={(e) => controls.start(e)}
          aria-label="Déplacer ce lien"
          className="touch-none cursor-grab text-muted/60 transition-colors hover:text-muted active:cursor-grabbing"
        >
          <GripVertical size={18} aria-hidden />
        </button>

        <span
          className={clsx(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-soft",
            bg,
            !link.enabled && "opacity-40"
          )}
        >
          <Icon size={18} aria-hidden />
        </span>

        <div className={clsx("min-w-0 flex-1", !link.enabled && "opacity-60")}>
          <p className="truncate text-sm font-semibold text-ink">{link.title}</p>
          <p className="truncate text-xs text-muted">
            {link.enabled ? "" : "Masqué · "}
            {link.url.replace(/^https?:\/\//, "")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onShowAnalytics?.(link)}
          disabled={!onShowAnalytics}
          title="Voir les statistiques de ce lien"
          className="hidden shrink-0 items-center gap-1.5 rounded-full bg-soft px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:text-fractal-terra sm:inline-flex"
        >
          <BarChart3 size={13} aria-hidden /> {link.clicks} clic{link.clicks > 1 ? "s" : ""}
        </button>

        <Switch
          checked={link.enabled}
          onChange={(v) => onUpdate(link.id, { enabled: v })}
          label={link.enabled ? "Masquer ce lien de ma page" : "Publier ce lien sur ma page"}
        />

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Modifier ce lien"
          aria-expanded={open}
          className={clsx(
            "rounded-full p-2 transition-colors",
            open ? "bg-fractal-ocre/10 text-fractal-terra" : "text-muted hover:bg-soft hover:text-ink"
          )}
        >
          <Settings2 size={16} aria-hidden />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid gap-3 border-t border-line bg-soft/40 px-4 pb-4 pt-4">
              <Field label="Titre">
                <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Adresse du lien">
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  inputMode="url"
                  className={inputClass}
                />
              </Field>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
                  <Trash2 size={14} aria-hidden /> Supprimer
                </Button>
                <div className="ml-auto flex items-center gap-2">
                  {onShowAnalytics && (
                    <Button variant="secondary" size="sm" onClick={() => onShowAnalytics(link)} className="sm:hidden">
                      <BarChart3 size={14} aria-hidden /> Statistiques
                    </Button>
                  )}
                  <Button size="sm" onClick={save}>
                    Enregistrer
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirming}
        title="Supprimer ce lien ?"
        message={`« ${link.title} » sera retiré de ta page. Tu pourras annuler juste après.`}
        confirmLabel="Supprimer"
        danger
        onConfirm={() => {
          setConfirming(false);
          onDelete(link.id);
        }}
        onCancel={() => setConfirming(false)}
      />
    </Reorder.Item>
  );
}
