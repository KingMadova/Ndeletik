export const RESERVED_USERNAMES = [
  "admin", "dashboard", "auth", "api", "settings", "support", "help",
  "pricing", "blog", "contact", "demo", "www", "mail", "ftp", "root",
  "system", "ndeletik", "yekola", "staff", "team", "security", "app",
  "new", "edit", "profile", "profiles", "links", "stats", "analytics",
  "confidentialite", "conditions", "legal",
];

export function isReserved(username: string): boolean {
  return RESERVED_USERNAMES.includes(username.toLowerCase());
}