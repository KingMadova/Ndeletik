import { ArrowLeft, LayoutDashboard, Users } from "lucide-react";
import type { NavItem } from "@/components/dashboard/nav";

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Vue d'ensemble", short: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Utilisateurs", short: "Utilisateurs", icon: Users },
];

export const BACK_ITEM: NavItem = { href: "/dashboard", label: "Mon dashboard", short: "Dashboard", icon: ArrowLeft };
