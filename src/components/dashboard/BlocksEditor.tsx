"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "./Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LINK_ICONS } from "@/components/profile/icons";
import type { Block, Social, SocialType } from "@/lib/themes/types";

const SOCIAL_TYPES: SocialType[] = [
  "instagram", "tiktok", "youtube", "facebook", "whatsapp",
  "x", "linkedin", "telegram", "pinterest", "email",
];

const ICON_KEYS = Object.keys(LINK_ICONS);

const BLOCK_LABELS: Record<string, string> = {
  about: "À propos",
  stats: "Chiffres clés",
  faq: "FAQ",
  newsletter: "Newsletter",
  offer: "Offre / service",
  contact: "Contact / adresse",
  hint: "Appel à l'action",
  separator: "Séparateur",
};

const inputCls =
  "w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink focus:outline-none focus:border-fractal-ocre transition-colors";

function newBlock(type: string): Block {
  switch (type) {
    case "about":      return { type: "about", title: "À propos", text: "" };
    case "stats":      return { type: "stats", items: [{ value: "100+", label: "Clients" }] };
    case "faq":        return { type: "faq", items: [{ q: "Question ?", a: "Réponse." }] };
    case "newsletter": return { type: "newsletter", title: "Rejoins ma newsletter", subtitle: "" };
    case "offer":      return { type: "offer", title: "Mon offre", desc: "", tag: "", cta: "Réserver", icon: "gift" };
    case "contact":    return { type: "contact", title: "Où me trouver", text: "", icon: "pin" };
    case "hint":       return { type: "hint", label: "Clique sur mes liens", emoji: "👆" };
    default:           return { type: "separator", label: "Conecte-se" };
  }
}

type Props = {
  profileId: string;
  initialBlocks: Block[];
  initialSocials: Social[];
};

export function SectionsEditor({ profileId, initialBlocks, initialSocials }: Props) {
  const { toast, node: toastNode } = useToast();
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [socials, setSocials] = useState<Social[]>(initialSocials);
  const [saving, setSaving] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const patch = (i: number, p: Partial<Block>) =>
    setBlocks((prev) => prev.map((b, j) => (j === i ? ({ ...b, ...p } as Block) : b)));

  const move = (i: number, dir: -1 | 1) =>
    setBlocks((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        blocks,
        socials: socials.filter((s) => s.url.trim() !== ""),
      })
      .eq("id", profileId);
    setSaving(false);
    if (error) return toast(`Enregistrement échoué : ${error.message}`, false);
    toast("Sections enregistrées");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Sections de ma page</h1>
          <p className="text-sm text-muted">Réseaux sociaux, offres, contact, FAQ… (10 blocs max)</p>
        </div>
        <button
          onClick={save}
          disabled={saving || blocks.length > 10}
          className="inline-flex items-center gap-2 rounded-xl bg-fractal-ocre hover:bg-fractal-terra px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-40"
        >
          <Save size={16} /> {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      {blocks.length > 10 && (
        <p className="rounded-xl border border-fractal-terra/30 bg-fractal-terra/10 p-3 text-sm text-fractal-terra">
          Maximum 10 blocs : supprime-en un pour pouvoir enregistrer.
        </p>
      )}

      {/* ---------- Réseaux sociaux ---------- */}
      <section className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
        <h2 className="mb-3 text-sm font-semibold">Réseaux sociaux ({socials.length}/12)</h2>
        <div className="space-y-2">
          {socials.map((s, i) => (
            <div key={i} className="flex gap-2">
              <select
                value={s.type}
                onChange={(e) =>
                  setSocials((prev) => prev.map((x, j) => (j === i ? { ...x, type: e.target.value as SocialType } : x)))
                }
                className={`${inputCls} w-36`}
                aria-label="Type de réseau"
              >
                {SOCIAL_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <input
                value={s.url}
                onChange={(e) => setSocials((prev) => prev.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
                placeholder="https://instagram.com/…"
                className={inputCls}
              />
              <button
                onClick={() => setSocials((prev) => prev.filter((_, j) => j !== i))}
                aria-label="Retirer"
                className="p-2 rounded-lg text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        {socials.length < 12 && (
          <button
            onClick={() => setSocials((prev) => [...prev, { type: "instagram", url: "" }])}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-line px-4 py-2 text-xs font-medium text-muted hover:border-fractal-ocre hover:text-fractal-terra transition-colors"
          >
            <Plus size={14} /> Ajouter un réseau
          </button>
        )}
      </section>

      {/* ---------- Blocs ---------- */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Blocs de contenu ({blocks.length}/10)</h2>

        {blocks.map((b, i) => (
          <div key={i} className="rounded-2xl border border-line bg-surface p-4 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-fractal-terra">
                {BLOCK_LABELS[b.type]}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => move(i, -1)} aria-label="Monter" className="p-1.5 rounded-md text-muted hover:bg-soft transition-colors"><ArrowUp size={14} /></button>
                <button onClick={() => move(i, 1)} aria-label="Descendre" className="p-1.5 rounded-md text-muted hover:bg-soft transition-colors"><ArrowDown size={14} /></button>
                <button onClick={() => setDeleteIndex(i)} aria-label="Supprimer" className="p-1.5 rounded-md text-muted hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>

            {b.type === "about" && (
              <>
                <input value={b.title} onChange={(e) => patch(i, { title: e.target.value })} placeholder="Titre" className={inputCls} />
                <textarea rows={3} value={b.text} onChange={(e) => patch(i, { text: e.target.value })} placeholder="Ton histoire…" className={inputCls} />
              </>
            )}

            {b.type === "stats" && (
              <div className="space-y-2">
                {b.items.map((s, k) => (
                  <div key={k} className="flex gap-2">
                    <input value={s.value} onChange={(e) => patch(i, { items: b.items.map((x, j) => (j === k ? { ...x, value: e.target.value } : x)) })} placeholder="500+" className={`${inputCls} w-24`} />
                    <input value={s.label} onChange={(e) => patch(i, { items: b.items.map((x, j) => (j === k ? { ...x, label: e.target.value } : x)) })} placeholder="Clients" className={inputCls} />
                  </div>
                ))}
                {b.items.length < 4 && (
                  <button onClick={() => patch(i, { items: [...b.items, { value: "", label: "" }] })} className="text-xs text-fractal-terra hover:text-fractal-ocre">+ Ajouter un chiffre</button>
                )}
              </div>
            )}

            {b.type === "faq" && (
              <div className="space-y-2">
                {b.items.map((f, k) => (
                  <div key={k} className="space-y-1 rounded-xl bg-soft p-2">
                    <input value={f.q} onChange={(e) => patch(i, { items: b.items.map((x, j) => (j === k ? { ...x, q: e.target.value } : x)) })} placeholder="Question" className={inputCls} />
                    <input value={f.a} onChange={(e) => patch(i, { items: b.items.map((x, j) => (j === k ? { ...x, a: e.target.value } : x)) })} placeholder="Réponse" className={inputCls} />
                  </div>
                ))}
                {b.items.length < 10 && (
                  <button onClick={() => patch(i, { items: [...b.items, { q: "", a: "" }] })} className="text-xs text-fractal-terra hover:text-fractal-ocre">+ Ajouter une question</button>
                )}
              </div>
            )}

            {b.type === "newsletter" && (
              <>
                <input value={b.title} onChange={(e) => patch(i, { title: e.target.value })} placeholder="Titre" className={inputCls} />
                <input value={b.subtitle ?? ""} onChange={(e) => patch(i, { subtitle: e.target.value })} placeholder="Sous-titre" className={inputCls} />
              </>
            )}

            {b.type === "offer" && (
              <>
                <div className="flex gap-2">
                  <input value={b.tag ?? ""} onChange={(e) => patch(i, { tag: e.target.value })} placeholder="Badge (ex : Aulas Presenciais)" className={`${inputCls} w-1/2`} />
                  <select value={b.icon ?? ""} onChange={(e) => patch(i, { icon: e.target.value || undefined })} className={`${inputCls} w-1/2`} aria-label="Icône">
                    <option value="">— Icône —</option>
                    {ICON_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <input value={b.title} onChange={(e) => patch(i, { title: e.target.value })} placeholder="Titre de l'offre" className={inputCls} />
                <input value={b.desc ?? ""} onChange={(e) => patch(i, { desc: e.target.value })} placeholder="Description courte" className={inputCls} />
                <div className="flex gap-2">
                  <input value={b.dateLabel ?? ""} onChange={(e) => patch(i, { dateLabel: e.target.value })} placeholder="Widget date : libellé" className={`${inputCls} w-1/3`} />
                  <input value={b.dateValue ?? ""} onChange={(e) => patch(i, { dateValue: e.target.value })} placeholder="Valeur" className={`${inputCls} w-1/3`} />
                  <input value={b.emoji ?? ""} onChange={(e) => patch(i, { emoji: e.target.value })} placeholder="Ou emoji" className={`${inputCls} w-1/3`} />
                </div>
                <input value={b.image ?? ""} onChange={(e) => patch(i, { image: e.target.value })} placeholder="URL image (https, optionnel)" className={inputCls} />
                <div className="flex gap-2">
                  <input value={b.cta ?? ""} onChange={(e) => patch(i, { cta: e.target.value })} placeholder="Bouton (ex : Réserver)" className={`${inputCls} w-1/2`} />
                  <input value={b.url ?? ""} onChange={(e) => patch(i, { url: e.target.value })} placeholder="Lien du bouton" className={`${inputCls} w-1/2`} />
                </div>
              </>
            )}

            {b.type === "contact" && (
              <>
                <div className="flex gap-2">
                  <select value={b.icon ?? ""} onChange={(e) => patch(i, { icon: e.target.value || undefined })} className={`${inputCls} w-1/2`} aria-label="Icône">
                    <option value="">— Icône —</option>
                    {ICON_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                  <input value={b.emoji ?? ""} onChange={(e) => patch(i, { emoji: e.target.value })} placeholder="Ou emoji (ex : 💈)" className={`${inputCls} w-1/2`} />
                </div>
                <input value={b.title} onChange={(e) => patch(i, { title: e.target.value })} placeholder="Titre" className={inputCls} />
                <input value={b.text ?? ""} onChange={(e) => patch(i, { text: e.target.value })} placeholder="Adresse / texte" className={inputCls} />
                <input value={b.url ?? ""} onChange={(e) => patch(i, { url: e.target.value })} placeholder="Lien (optionnel, ex : itinéraire)" className={inputCls} />
              </>
            )}

            {b.type === "hint" && (
              <div className="flex gap-2">
                <input value={b.emoji ?? ""} onChange={(e) => patch(i, { emoji: e.target.value })} placeholder="Emoji (ex : 👆)" className={`${inputCls} w-24`} />
                <input value={b.label} onChange={(e) => patch(i, { label: e.target.value })} placeholder="Texte (ex : Clique sur mes icônes)" className={inputCls} />
              </div>
            )}

            {b.type === "separator" && (
              <input value={b.label ?? ""} onChange={(e) => patch(i, { label: e.target.value })} placeholder="Libellé (ex : Conecte-se)" className={inputCls} />
            )}
          </div>
        ))}

        <div className="flex flex-wrap gap-2">
          {Object.keys(BLOCK_LABELS).map((t) => (
            <button
              key={t}
              onClick={() => setBlocks((prev) => (prev.length >= 10 ? prev : [...prev, newBlock(t)]))}
              disabled={blocks.length >= 10}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted hover:border-fractal-ocre hover:text-fractal-terra transition-colors disabled:opacity-40"
            >
              <Plus size={12} /> {BLOCK_LABELS[t]}
            </button>
          ))}
        </div>
      </section>

      <ConfirmDialog
        open={deleteIndex !== null}
        title="Supprimer ce bloc ?"
        message="Le bloc sera retiré de ta page publique."
        confirmLabel="Supprimer"
        danger
        onConfirm={() => {
          if (deleteIndex !== null) setBlocks((prev) => prev.filter((_, j) => j !== deleteIndex));
          setDeleteIndex(null);
        }}
        onCancel={() => setDeleteIndex(null)}
      />
      {toastNode}
    </div>
  );
}