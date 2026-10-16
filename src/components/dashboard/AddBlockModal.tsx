"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { detectIcon } from "@/lib/detect-icon";
import { normalizeUrl } from "./blockMeta";
import { validUrl } from "./LinkItem";
import { useToast } from "./Toast";

const PRESETS = [
  { label: "Site web", title: "Mon site web", prefix: "" },
  { label: "WhatsApp", title: "Mon WhatsApp", prefix: "wa.me/" },
  { label: "Instagram", title: "Mon Instagram", prefix: "instagram.com/" },
  { label: "TikTok", title: "Mon TikTok", prefix: "tiktok.com/@" },
  { label: "YouTube", title: "Ma chaîne YouTube", prefix: "youtube.com/@" },
  { label: "E-mail", title: "Me contacter", prefix: "" },
];

export type BlockPreset = { title: string; url: string; icon?: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (title: string, url: string, icon?: string) => Promise<boolean>;
  initial?: BlockPreset;
};

export function AddBlockModal({ open, onClose, onAdd, initial }: Props) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? "");
    setUrl(initial?.url ?? "");
  }, [open, initial]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || busy) return;
    if (!validUrl(url)) return toast("Adresse invalide (ex : https://… ou wa.me/…)", false);
    setBusy(true);
    const icon = initial?.icon && initial.icon !== "link" ? initial.icon : detectIcon(normalizeUrl(url));
    const ok = await onAdd(title.trim(), url.trim(), icon);
    setBusy(false);
    if (ok) onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Ajouter un lien" description="Il apparaîtra tout de suite sur ta page.">
      <form onSubmit={submit} className="grid gap-4">
        <div className="flex flex-wrap gap-2" aria-label="Modèles">
          {PRESETS.map((p) => (
            <button
              type="button"
              key={p.label}
              onClick={() => {
                setTitle(p.title);
                setUrl(p.prefix);
              }}
              className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-fractal-ocre hover:text-fractal-terra"
            >
              {p.label}
            </button>
          ))}
        </div>

        <Field label="Titre du bouton">
          <input
            data-autofocus={initial?.url ? undefined : ""}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex : Mon WhatsApp"
            className={inputClass}
          />
        </Field>
        <Field label="Adresse du lien" hint="Lien, numéro WhatsApp (wa.me/…) ou e-mail.">
          <input
            data-autofocus={initial?.url ? "" : undefined}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            inputMode="url"
            placeholder="https://…"
            className={inputClass}
          />
        </Field>

        <Button type="submit" size="lg" full disabled={busy || !title.trim() || !url.trim()}>
          {busy ? "Ajout…" : "Ajouter le lien"}
        </Button>
      </form>
    </Modal>
  );
}
