"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Sparkles, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { hasTransparency } from "@/lib/image-transparency";
import { useToast } from "@/components/dashboard/Toast";
import type { ImageMode } from "@/lib/themes/types";

const MODES: { id: ImageMode; label: string; hint: string }[] = [
  { id: "cover", label: "Couvrir", hint: "La photo remplit la carte." },
  { id: "popout", label: "Déborder", hint: "PNG détouré qui dépasse de la carte." },
  { id: "contain", label: "Entière", hint: "Image entière dans la carte (mockup)." },
];

const MAX_SIZE = 2 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/webp", "image/jpeg"];

const ADVICE =
  "Pour un beau détourage, supprime le fond avant d'uploader : Canva (« Supprimer l'arrière-plan ») ou remove.bg.";

type Props = {
  /** "link" = image d'un lien ; "hero" = portrait d'en-tête du profil. */
  kind: "link" | "hero";
  value: string | null;
  mode?: ImageMode;
  onImage: (url: string | null) => void;
  onMode?: (mode: ImageMode) => void;
};

export function LinkImageField({ kind, value, mode = "cover", onImage, onMode }: Props) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [warn, setWarn] = useState<string | null>(null);

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) return toast("Format accepté : PNG, WebP ou JPEG", false);
    if (file.size > MAX_SIZE) return toast("2 Mo maximum", false);

    setBusy(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setBusy(false);
      return;
    }
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${session.user.id}/${kind}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      setBusy(false);
      return toast(`Upload échoué : ${error.message}`, false);
    }
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    onImage(data.publicUrl);

    // Avertissement non bloquant si le fond n'est pas transparent alors qu'il devrait l'être.
    if (kind === "hero" || mode !== "cover") {
      const transparent = await hasTransparency(data.publicUrl);
      setWarn(
        transparent === false
          ? "Cette image a un fond plein. Pour « Déborder » ou le portrait d'en-tête, utilise un PNG/WebP à fond transparent."
          : null
      );
    } else {
      setWarn(null);
    }
    setBusy(false);
    toast("Image en ligne");
  };

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-soft">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={18} className="text-muted" />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input ref={inputRef} type="file" accept={ACCEPTED.join(",")} className="hidden" onChange={pick} />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-xs font-medium text-ink transition-colors hover:border-fractal-ocre hover:text-fractal-terra disabled:opacity-50"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
            {busy ? "Envoi…" : value ? "Remplacer" : "Uploader"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => {
                onImage(null);
                setWarn(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={14} /> Retirer
            </button>
          )}
        </div>
      </div>

      {onMode && value && (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Mode d'affichage de l'image">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={mode === m.id}
              title={m.hint}
              onClick={() => onMode(m.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === m.id
                  ? "border-fractal-ocre bg-fractal-ocre/10 text-fractal-terra"
                  : "border-line text-muted hover:border-fractal-ocre/50 hover:text-ink"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      <p className="text-[11px] leading-relaxed text-muted">{ADVICE}</p>
      {warn && (
        <p className="rounded-xl border border-fractal-or/40 bg-fractal-or/10 px-3 py-2 text-[11px] text-fractal-terra">
          {warn}
        </p>
      )}

      <button
        type="button"
        disabled
        title="Bientôt disponible"
        className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-2 text-xs font-medium text-muted/70"
      >
        <Sparkles size={13} /> Supprimer le fond automatiquement — bientôt disponible
      </button>
    </div>
  );
}