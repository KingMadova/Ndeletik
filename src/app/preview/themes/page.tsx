import { ALL_THEMES } from "@/lib/themes/registry";

// Galerie de test : chaque thème dans un cadre mobile (/preview/themes).
export default function ThemesGallery() {
  return (
    <main style={{ padding: 24, background: "#eee", minHeight: "100vh", fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 16 }}>Thèmes Ndeletik ({ALL_THEMES.length})</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
        {ALL_THEMES.map((t) => (
          <figure key={t.id} style={{ margin: 0 }}>
            <iframe
              src={`/preview?theme=${t.id}&plan=business`}
              title={t.name}
              style={{ width: 375, height: 760, border: "8px solid #111", borderRadius: 32, background: "#fff" }}
            />
            <figcaption style={{ marginTop: 8, fontSize: 14 }}>
              <strong>{t.name}</strong> · {t.plan} · <code>{t.id}</code>
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}