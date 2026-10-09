import { BadgeCheck, Smartphone, Zap } from "lucide-react";
import Link from "next/link";
import { Card, GradText, Mark, SectionTitle, grad } from "./ui";

const bars = [30, 55, 40, 75, 50, 90, 62, 80, 45, 70, 58, 85];

export function Benefits() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20">
      <SectionTitle label="Avantages">
        Conçu pour t&apos;aider à <Mark /> <GradText>grandir</GradText>
      </SectionTitle>

      <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
        {/* Paiements : couleurs officielles des opérateurs */}
        <Card className="p-5">
          <div className="flex h-36 items-center justify-center rounded-2xl bg-soft">
            <div className="flex -space-x-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-surface bg-[#FFCC00] text-[9px] font-extrabold text-[#003366] shadow-soft">
                MTN
              </span>
              <span className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-surface bg-[#ED1C24] text-[8px] font-extrabold text-white shadow-soft">
                Airtel
              </span>
              <span className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-surface bg-[#00C0F3] text-[9px] font-extrabold text-white shadow-soft">
                Wave
              </span>
            </div>
          </div>
          <h3 className="mt-4 text-sm font-bold">Paiements Mobile Money</h3>
          <p className="mt-1 text-xs text-muted">Reçois l&apos;argent de tes fans directement sur ton numéro.</p>
        </Card>

        {/* Stats temps réel */}
        <Card className="p-5">
          <div className="flex h-36 items-end gap-1.5 rounded-2xl bg-soft p-4">
            {bars.map((h, i) => (
              <span
                key={i}
                className={`flex-1 rounded-full ${grad}`}
                style={{ height: `${h}%`, opacity: 0.55 + (h / 100) * 0.45 }}
              />
            ))}
          </div>
          <h3 className="mt-4 text-sm font-bold">Statistiques en temps réel</h3>
          <p className="mt-1 text-xs text-muted">Chaque clic, chaque vente, sur un seul tableau de bord.</p>
        </Card>

        {/* Carte mise en avant */}
        <div className={`flex flex-col justify-between rounded-3xl p-6 text-white shadow-soft md:row-span-2 ${grad}`}>
          <div>
            <Zap />
            <h3 className="mt-4 font-display text-xl font-bold">Monétise ton audience</h3>
            <p className="mt-2 text-sm text-white/85">
              Vends tes formations, tes produits et tes services depuis ta page, sans site web.
            </p>
          </div>
          <Link href="/auth" className="mt-8 inline-flex w-fit rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bg">
            Créer ma page
          </Link>
        </div>

        {/* Liens vérifiés */}
        <Card className="p-5">
          <div className="flex h-28 flex-col justify-center gap-2 rounded-2xl bg-soft p-4">
            {["Lien vérifié", "Lien vérifié"].map((t, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-xs shadow-soft">
                <BadgeCheck size={14} className="text-fractal-ocre" /> {t}
              </div>
            ))}
          </div>
          <h3 className="mt-4 text-sm font-bold">Zéro lien cassé</h3>
          <p className="mt-1 text-xs text-muted">On vérifie tes liens et on t&apos;alerte avant tes visiteurs.</p>
        </Card>

        {/* Mobile */}
        <Card className="p-5">
          <div className="flex h-28 items-center justify-center rounded-2xl bg-soft">
            <Smartphone size={44} className="text-fractal-ocre" />
          </div>
          <h3 className="mt-4 text-sm font-bold">Pensé pour le mobile</h3>
          <p className="mt-1 text-xs text-muted">Léger, rapide, même avec une connexion limitée.</p>
        </Card>

        {/* Mise en ligne */}
        <Card className="p-5 md:col-span-2">
          <div className="flex h-24 flex-wrap items-center justify-center gap-3 rounded-2xl bg-soft text-xs font-medium">
            {["Compte", "Liens", "Design", "En ligne"].map((s, i) => (
              <span key={s} className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 ${i === 3 ? `${grad} text-white` : "bg-surface"}`}>{s}</span>
                {i < 3 && <span className="h-px w-4 bg-line" />}
              </span>
            ))}
          </div>
          <h3 className="mt-4 text-sm font-bold">En ligne en moins de 5 minutes</h3>
          <p className="mt-1 text-xs text-muted">Pas de code, pas d&apos;installation. Tu partages ton lien et c&apos;est parti.</p>
        </Card>
      </div>
    </section>
  );
}