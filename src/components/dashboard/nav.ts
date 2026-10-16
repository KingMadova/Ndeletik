import { BarChart3, LayoutList, Link2, SwatchBook, User, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; short: string; icon: LucideIcon; exact?: boolean };

export const NAV: NavItem[] = [
  { href: "/dashboard", label: "Mes liens", short: "Liens", icon: Link2, exact: true },
  { href: "/dashboard/profile", label: "Profil", short: "Profil", icon: User },
  { href: "/dashboard/themes", label: "Thèmes", short: "Thèmes", icon: SwatchBook },
  { href: "/dashboard/sections", label: "Sections", short: "Sections", icon: LayoutList },
  { href: "/dashboard/stats", label: "Statistiques", short: "Stats", icon: BarChart3 },
];

export const isActive = (item: NavItem, pathname: string) =>
  item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
