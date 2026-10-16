import { ImageResponse } from "next/og";
import type { ThemeTokens } from "@/lib/themes/types";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_TYPE = "image/png";

const BRAND = { or: "#F9A825", ocre: "#FF6A1A", terra: "#C1440E", creme: "#FFF9F3" };

/** Image de partage de la landing (Open Graph / Twitter). */
export function landingOg() {
  const pills = ["Ma boutique", "Commandes WhatsApp", "Ma chaîne YouTube"];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "64px 80px",
          background: `linear-gradient(135deg, ${BRAND.or} 0%, ${BRAND.ocre} 55%, ${BRAND.terra} 100%)`,
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div style={{ display: "flex", fontSize: 34, letterSpacing: -0.5 }}>Ndeletik</div>
          <div style={{ display: "flex", fontSize: 76, lineHeight: 1.05, marginTop: 28 }}>
            Ta bio, tes liens, tes ventes.
          </div>
          <div style={{ display: "flex", fontSize: 30, marginTop: 28, opacity: 0.92 }}>
            La page de liens des créateurs africains. Mobile Money, 18 thèmes, statistiques.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 300,
            height: 470,
            borderRadius: 44,
            background: BRAND.creme,
            padding: "36px 24px",
            boxShadow: "0 20px 50px rgba(0,0,0,.25)",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 84,
              height: 84,
              borderRadius: 42,
              background: `linear-gradient(135deg, ${BRAND.or}, ${BRAND.terra})`,
            }}
          />
          <div style={{ display: "flex", color: "#18181B", fontSize: 24, marginTop: 14 }}>@toi</div>
          {pills.map((p) => (
            <div
              key={p}
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                marginTop: 14,
                padding: "14px 8px",
                borderRadius: 999,
                background: "#fff",
                border: "2px solid #ECE4DA",
                color: "#18181B",
                fontSize: 19,
              }}
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}

/**
 * Télécharge l'avatar et le convertit en data URI pour que le rendu ne dépende
 * pas d'un téléchargement distant. PNG/JPEG uniquement (formats gérés par le moteur
 * d'image) ; renvoie null au moindre doute (le visuel retombe sur l'initiale).
 */
export async function avatarDataUri(url?: string): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) return null;
    const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
    if (type !== "image/png" && type !== "image/jpeg") return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0 || buf.length > 400_000) return null;
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

type ProfileOgInput = {
  name: string;
  slug: string;
  headline?: string;
  avatar: string | null;
  tokens: ThemeTokens;
};

/** Image de partage d'une page publique, aux couleurs du thème du profil. */
export function profileOg({ name, slug, headline, avatar, tokens: t }: ProfileOgInput) {
  const initial = (name.trim()[0] ?? "N").toUpperCase();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: t.bg,
          color: t.text,
          padding: 64,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 220,
            height: 220,
            borderRadius: 110,
            overflow: "hidden",
            border: `8px solid ${t.accent}`,
            background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
            color: t.onAccent,
            fontSize: 110,
          }}
        >
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} width={220} height={220} alt="" style={{ objectFit: "cover" }} />
          ) : (
            initial
          )}
        </div>
        <div style={{ display: "flex", fontSize: 68, marginTop: 36, textAlign: "center" }}>{name.slice(0, 40)}</div>
        {headline ? (
          <div style={{ display: "flex", fontSize: 32, marginTop: 14, color: t.muted, textAlign: "center" }}>
            {headline.slice(0, 80)}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            marginTop: 40,
            padding: "14px 34px",
            borderRadius: 999,
            background: t.accent,
            color: t.onAccent,
            fontSize: 30,
          }}
        >
          ndeletik.vercel.app/@{slug}
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
