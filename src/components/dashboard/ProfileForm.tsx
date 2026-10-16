"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Field, inputClass } from "@/components/ui/Field";
import { useDashboard } from "./DashboardProvider";
import { ProfileAvatar } from "./ProfileAvatar";
import { UploadButton } from "./UploadButton";

/** Photo, bannière et informations du profil. À monter avec key={profileId} pour repartir des bonnes valeurs. */
export function ProfileForm() {
  const { row, saveProfile } = useDashboard();
  const [f, setF] = useState({
    slug: row?.slug ?? "",
    displayName: row?.display_name ?? "",
    headline: row?.headline ?? "",
    bio: row?.bio ?? "",
    avatarUrl: row?.avatar_url ?? "",
    coverUrl: row?.cover_url ?? "",
  });
  const [saving, setSaving] = useState(false);
  if (!row) return null;

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const cleanSlug = f.slug.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "") || row.slug;
  const dirty =
    cleanSlug !== row.slug ||
    f.displayName.trim() !== row.display_name ||
    f.headline.trim() !== (row.headline ?? "") ||
    f.bio.trim() !== (row.bio ?? "");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await saveProfile({
      slug: cleanSlug,
      displayName: f.displayName.trim() || row.display_name,
      headline: f.headline.trim() || undefined,
      bio: f.bio.trim() || undefined,
    });
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <CardTitle hint="Format carré, 3 Mo maximum. Enregistrée tout de suite.">Photo de profil</CardTitle>
        <div className="flex items-center gap-4">
          <ProfileAvatar profile={{ ...row, avatar_url: f.avatarUrl || null }} size={80} />
          <UploadButton
            kind="avatar"
            onDone={(url) => {
              setF((p) => ({ ...p, avatarUrl: url }));
              saveProfile({ avatarUrl: url });
            }}
          />
        </div>
      </Card>

      <Card>
        <CardTitle hint="Format rectangulaire, 3 Mo maximum. Enregistrée tout de suite.">Bannière</CardTitle>
        <div className="mb-3 h-24 overflow-hidden rounded-xl border border-line bg-fractal-ocre/15">
          {f.coverUrl && <div className="h-full bg-cover bg-center" style={{ backgroundImage: `url(${f.coverUrl})` }} />}
        </div>
        <UploadButton
          kind="banner"
          onDone={(url) => {
            setF((p) => ({ ...p, coverUrl: url }));
            saveProfile({ coverUrl: url });
          }}
        />
      </Card>

      <Card className="space-y-4">
        <CardTitle>Informations</CardTitle>
        <Field label="Pseudo" hint={`Ton adresse publique : /@${cleanSlug}`}>
          <input value={f.slug} onChange={set("slug")} className={inputClass} autoCapitalize="none" autoCorrect="off" />
        </Field>
        <Field label="Nom affiché">
          <input value={f.displayName} onChange={set("displayName")} className={inputClass} />
        </Field>
        <Field label="Titre (sous le nom)">
          <input value={f.headline} onChange={set("headline")} className={inputClass} placeholder="Ex : Coach business · Pointe-Noire" />
        </Field>
        <Field label="Bio">
          <textarea rows={3} value={f.bio} onChange={set("bio")} className={inputClass} />
        </Field>
        <Button type="submit" size="lg" full disabled={!dirty || saving}>
          {saving ? "Enregistrement…" : dirty ? "Enregistrer les modifications" : "Aucune modification"}
        </Button>
      </Card>
    </form>
  );
}
