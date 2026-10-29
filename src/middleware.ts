import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

// ...
const { data: { user } } = await supabase.auth.getUser();

// Routes protégées : ajout de /admin
const protectedPaths = ["/dashboard", "/onboarding", "/admin"];
const isProtected = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));

if (isProtected && !user) {
  return NextResponse.redirect(new URL("/auth", request.url));
}
// ...

  // Redirection onboarding : si l'utilisateur est connecté mais n'a pas complété l'onboarding
  if (user && request.nextUrl.pathname === "/dashboard") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("user_id", user.id)
      .single();

    if (profile && !profile.onboarding_completed) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  // Si l'utilisateur a complété l'onboarding et essaie d'accéder à /onboarding, rediriger vers /dashboard
  if (user && request.nextUrl.pathname === "/onboarding") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("user_id", user.id)
      .single();

    if (profile && profile.onboarding_completed) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding"],
};