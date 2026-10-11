import { createBrowserClient } from "@supabase/ssr";

/**
 * Client navigateur basé sur les COOKIES (nécessaire pour que les
 * Server Components et le middleware voient la session).
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);