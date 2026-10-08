"use client";
import { useRef, useState } from "react";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { CropModal } from "./CropModal";

type Props = {
  kind: "avatar" | "banner";
  onDone: (url: string) => void;
};

const MAX_SIZE = 3 * 1024 * 1024;

export function UploadButton({ kind, onDone }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const aspect = kind === "avatar" ? 1 : 3;

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setState("err");
      setMsg("Image uniquement");
      return;
    }
    if (file.size > MAX_SIZE) {
      setState("err");
      setMsg("3 Mo maximum");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async (blob: Blob) => {
    setState("busy");
    setImageSrc(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const path = `${session.user.id}/${kind}-${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("media").upload(path, blob, {
      contentType: "image/jpeg",
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      setState("err");
      setMsg("Upload échoué");
      return;
    }
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    onDone(data.publicUrl);
    setState("ok");
    setTimeout(() => setState("idle"), 2500);
  };

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={pick} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={state === "busy"}
        className="inline-flex items-center gap-2 rounded-lg border border-line hover:border-fractal-ocre text-ink hover:text-fractal-terra text-xs px-3 py-2 transition-colors disabled:opacity-50 bg-surface"
      >
        {state === "busy" ? (
          <Loader2 size={14} className="animate-spin text-fractal-ocre" />
        ) : state === "ok" ? (
          <CheckCircle2 size={14} className="text-fractal-ocre" />
        ) : state === "err" ? (
          <AlertCircle size={14} className="text-red-500" />
        ) : (
          <Upload size={14} />
        )}
        {state === "busy" ? "Envoi…" : state === "ok" ? "En ligne !" : state === "err" ? msg : "Uploader"}
      </button>

      {imageSrc && (
        <CropModal imageSrc={imageSrc} aspect={aspect} onConfirm={handleCropConfirm} onClose={() => setImageSrc(null)} />
      )}
    </>
  );
}