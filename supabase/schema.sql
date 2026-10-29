-- ==========================================
-- CORRECTION DES DROITS API (SUPABASE)
-- ==========================================

-- 1. Droit de lecture publique (pour les visiteurs non connectés)
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.links TO anon;
GRANT SELECT ON public.accounts TO anon;
GRANT SELECT ON public.link_clicks TO anon;
GRANT SELECT ON public.short_links TO anon;
GRANT SELECT ON public.subscribers TO anon;
GRANT SELECT ON public.themes_catalog TO anon;
GRANT SELECT ON public.plan_entitlements TO anon;

-- 2. Droits complets pour les utilisateurs connectés (dashboard)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.link_clicks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.short_links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscribers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.themes_catalog TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_entitlements TO authenticated;

-- 3. Droits complets pour le backend (service_role)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.links TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.link_clicks TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.short_links TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscribers TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.themes_catalog TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_entitlements TO service_role;