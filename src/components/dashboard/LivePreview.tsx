"use client";

import { Eye } from "lucide-react";
import { ProfileRenderer } from "@/components/profile/ProfileRenderer";
import { buttonClass } from "@/components/ui/Button";
import { useDashboard } from "./DashboardProvider";

/** Téléphone d'aperçu : reflète en direct les liens, le profil et le thème de la page. */
export function LivePreview({ framed = true }: { framed?: boolean }) {
  const { profile, plan, row } = useDashboard();
  if (!profile || !row) return null;

  const phone = (
    <div className="nd-phone nd-phone-sm mx-auto">
      <div className="nd-screen">
        <ProfileRenderer profile={profile} plan={plan} preview />
      </div>
    </div>
  );

  if (!framed) return phone;

  return (
    <div className="rounded-3xl border border-line bg-surface p-5 text-center shadow-soft">
      <p className="mb-4 font-display text-sm font-bold text-ink">Aperçu en direct</p>
      {phone}
      <a
        href={`/@${row.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass({ variant: "secondary", full: true, className: "mt-4" })}
      >
        <Eye size={16} aria-hidden /> Voir ma page publique
      </a>
    </div>
  );
}
