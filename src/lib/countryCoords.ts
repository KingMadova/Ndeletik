import { ALL_COUNTRIES } from "./countries";

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

// Compatibilité avec les anciennes saisies libres (aucune migration SQL nécessaire)
const ALIASES: Record<string, string> = {
  congo: "République du Congo",
  congobrazzaville: "République du Congo",
  rdc: "RD Congo",
  drc: "RD Congo",
  congokinshasa: "RD Congo",
  congodemocratique: "RD Congo",
  cotedivoire: "Côte d'Ivoire",
  ivorycoast: "Côte d'Ivoire",
  centrafricaine: "Centrafrique",
  guineeequatoriale: "Guinée équatoriale",
  afriquedusud: "Afrique du Sud",
  southafrica: "Afrique du Sud",
  swaziland: "Eswatini",
  ilesmaurice: "Maurice",
  reunion: "Réunion",
  lareunion: "Réunion",
  usa: "États-Unis",
  us: "États-Unis",
  etatsunis: "États-Unis",
  uk: "Royaume-Uni",
  angleterre: "Royaume-Uni",
};

export function getCoords(raw: string | null): [number, number] | null {
  if (!raw) return null;

  // 1. Correspondance exacte (valeurs issues du dropdown)
  const exact = ALL_COUNTRIES.find((c) => c.name === raw);
  if (exact) return [exact.lat, exact.lon];

  // 2. Alias legacy (anciennes saisies libres)
  const n = norm(raw);
  const alias = ALIASES[n];
  if (alias) {
    const c = ALL_COUNTRIES.find((x) => x.name === alias);
    if (c) return [c.lat, c.lon];
  }

  // 3. Correspondance normalisée (accents / espaces ignorés)
  const fuzzy = ALL_COUNTRIES.find((c) => norm(c.name) === n);
  return fuzzy ? [fuzzy.lat, fuzzy.lon] : null;
}