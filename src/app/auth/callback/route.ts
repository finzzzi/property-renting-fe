import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const type = searchParams.get("type");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      } else if (type === "email_change") {
        return NextResponse.redirect(`${origin}/profile?email_changed=true`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error("Auth callback - error exchanging code:", error);
    }
  }

  // Tambahan: handle email_change yang masih membutuhkan konfirmasi kedua
  if (type === "email_change" && !code) {
    return NextResponse.redirect(`${origin}/auth/email-change-pending`);
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
