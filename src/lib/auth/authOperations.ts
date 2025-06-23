import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export const signInWithGoogle = async () => {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const signInWithFacebook = async () => {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      console.error("Error signing in with Facebook:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error signing in with Facebook:", error);
    throw error;
  }
};

export const signInWithEmail = async (
  email: string,
  fullName: string,
  role: string
) => {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) {
      console.error("Error signing in with email:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error signing in with email:", error);
    throw error;
  }
};

export const signInWithPassword = async (email: string, password: string) => {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error signing in with password:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error signing in with password:", error);
    throw error;
  }
};

export const updatePassword = async (user: User | null, password: string) => {
  const supabase = createClient();

  try {
    const { error: rpcError } = await supabase.rpc(
      "update_user_password_and_metadata",
      {
        user_id: user?.id,
        new_password: password,
      }
    );

    if (rpcError) {
      console.error("Error updating password and metadata:", rpcError);
      throw rpcError;
    }
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
};

export const signOut = async () => {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const refreshUserSession = async () => {
  const supabase = createClient();

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.refreshSession();

    if (sessionError) {
      console.error("Error refreshing session:", sessionError);
      throw sessionError;
    }

    return session;
  } catch (error) {
    console.error("Error refreshing user session:", error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=recovery`,
    });

    if (error) {
      console.error("Error sending reset password email:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in reset password:", error);
    throw error;
  }
};

export const updatePasswordWithToken = async (newPassword: string) => {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error updating password with token:", error);
    throw error;
  }
};
