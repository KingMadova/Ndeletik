export type AdminRow = {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  avatar_url: string | null;
  country: string | null;
  views: number;
  theme_id: string;
  created_at: string;
  plan: string;
  role: string;
  links_count: number;
  clicks_total: number;
};

export const PLAN_COLORS: Record<string, string> = { free: "#F9A825", pro: "#FF6A1A", business: "#C1440E" };
export const PLAN_LABELS: Record<string, string> = { free: "Gratuit", pro: "Pro", business: "Business" };
export const PLAN_ORDER = ["free", "pro", "business"];

export type SortKey = "recent" | "old" | "clicks" | "views" | "links" | "az";

export const SORTS: { id: SortKey; label: string }[] = [
  { id: "recent", label: "Inscriptions récentes" },
  { id: "old", label: "Inscriptions anciennes" },
  { id: "clicks", label: "Plus de clics" },
  { id: "views", label: "Plus de vues" },
  { id: "links", label: "Plus de liens" },
  { id: "az", label: "Pseudo A → Z" },
];

export const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);
export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR");
