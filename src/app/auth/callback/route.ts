import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  console.log("Auth callback - code:", code ? "present" : "missing");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      console.log("Auth callback - session exchanged successfully");
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error("Auth callback - error exchanging code:", error);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
