// Coordonnées approximatives (centroïdes), clés normalisées
const COORDS: Record<string, [number, number]> = {
  congo: [-0.7, 15.4], "rd congo": [-2.9, 23.6], rdc: [-2.9, 23.6], drc: [-2.9, 23.6],
  "congo kinshasa": [-2.9, 23.6], "congo brazzaville": [-0.7, 15.4],
  "cote d ivoire": [7.5, -5.5], senegal: [14.5, -14.5], cameroun: [5.7, 12.7],
  gabon: [-0.8, 11.6], benin: [9.3, 2.3], togo: [8.6, 0.8], burkina: [12.2, -1.6],
  mali: [17.6, -4.0], niger: [17.6, 8.1], tchad: [15.5, 18.7], guinee: [10.4, -10.9],
  "guinee equatoriale": [1.7, 10.5], centrafrique: [6.6, 20.9], rwanda: [-1.9, 29.9],
  burundi: [-3.4, 29.9], ouganda: [1.4, 32.3], kenya: [0.2, 37.9], tanzanie: [-6.4, 34.9],
  "afrique du sud": [-29.0, 25.1], nigeria: [9.1, 8.7], ghana: [7.9, -1.0],
  maroc: [31.8, -7.1], algerie: [28.0, 1.7], tunisie: [33.9, 9.5], egypte: [26.8, 30.8],
  ethiopie: [9.1, 40.5], angola: [-11.2, 17.9], zambie: [-13.1, 27.8], zimbabwe: [-19.0, 29.2],
  mozambique: [-18.7, 35.5], madagascar: [-19.4, 46.7], maurice: [-20.3, 57.6],
  seychelles: [-4.7, 55.5], "cap vert": [15.1, -23.6], gambie: [13.4, -15.3],
  "guinee bissau": [11.9, -15.6], liberia: [6.4, -9.4], "sierra leone": [8.6, -11.8],
  mauritanie: [21.0, -10.9], libye: [26.3, 17.2], soudan: [15.6, 30.2],
  "soudan du sud": [7.9, 31.3], djibouti: [11.8, 43.2], somalie: [5.2, 46.2],
  namibie: [-22.9, 18.5], botswana: [-22.3, 24.7], malawi: [-13.3, 34.3],
  france: [46.6, 2.2], belgique: [50.5, 4.5], suisse: [46.8, 8.2], luxembourg: [49.8, 6.1],
  allemagne: [51.1, 10.4], espagne: [40.4, -3.7], portugal: [39.4, -8.2], italie: [41.9, 12.6],
  "pays bas": [52.1, 5.3], "royaume uni": [54.0, -2.5], uk: [54.0, -2.5],
  "etats unis": [39.8, -98.6], usa: [39.8, -98.6], canada: [56.1, -106.3],
  mexique: [23.6, -102.5], bresil: [-14.2, -51.9], colombie: [4.6, -74.3], haiti: [18.9, -72.3],
  chine: [35.9, 104.2], inde: [20.6, 79.0], japon: [36.2, 138.3], australie: [-25.3, 133.8],
  turquie: [39.0, 35.2], emirats: [23.4, 53.8], dubai: [25.2, 55.3],
  "arabie saoudite": [23.9, 45.1], israel: [31.0, 34.9], liban: [33.9, 35.9],
  russie: [61.5, 105.3], ukraine: [48.4, 31.2], pologne: [51.9, 19.1],
};

export function normalizeCountry(raw: string | null): string | null {
  if (!raw) return null;
  const n = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return COORDS[n] ? n : null;
}

export function getCoords(raw: string | null): [number, number] | null {
  const n = normalizeCountry(raw);
  return n ? COORDS[n] : null;
}