import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const excludedPaths = [
    "/login",
    "/register",
    "/profile",
    "/auth/callback",
    "/auth/auth-code-error",
    "/reset-password",
  ];
  const isExcludedPath = excludedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Jika ada user yang login
  if (user && !isExcludedPath) {
    const hasPassword = user.app_metadata?.has_password;
    const provider = user.app_metadata?.provider;

    // Jika user email provider dan belum set password, redirect ke profile
    if (provider === "email" && !hasPassword) {
      return NextResponse.redirect(new URL("/profile", request.url));
    }

    // Jika user sudah lengkap, cek role dan redirect sesuai role
    if (hasPassword || provider !== "email") {
      try {
        // Ambil role user dari database
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        const userRole = userData?.role;

        // Jika user adalah owner
        if (userRole === "owner") {
          // Jika owner mengakses homepage, redirect ke /owner
          if (request.nextUrl.pathname === "/") {
            return NextResponse.redirect(new URL("/owner", request.url));
          }
        }

        // Protect route /owner - hanya untuk owner
        if (request.nextUrl.pathname.startsWith("/owner")) {
          if (userRole !== "owner") {
            return NextResponse.redirect(new URL("/", request.url));
          }
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      }
    }
  }

  // Jika tidak ada user dan mengakses route /owner, redirect ke login
  if (!user && request.nextUrl.pathname.startsWith("/owner")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
