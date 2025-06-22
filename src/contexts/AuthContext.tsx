"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: "traveler" | "owner";
  profile_picture?: string;
  phone?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

interface EmailStatusResult {
  exists: boolean;
  verified: boolean;
  userId?: string;
}

interface UserRoleResult {
  exists: boolean;
  role?: "traveler" | "owner";
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithEmail: (
    email: string,
    fullName: string,
    role: string
  ) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  refreshUserSession: () => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
  checkEmailStatus: (email: string) => Promise<EmailStatusResult>;
  checkUserRole: (email: string) => Promise<UserRoleResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const isEmailProvider = (user: User) => {
    return user.app_metadata?.provider === "email";
  };

  const updateOAuthUserRole = async (userId: string) => {
    const role = localStorage.getItem("selectedRole");
    if (!role) return;

    try {
      const { data: existingUser } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (!existingUser?.role) {
        await supabase.auth.updateUser({
          data: {
            role: role,
          },
        });
        await supabase.from("users").update({ role }).eq("id", userId);
      }
    } catch (roleError) {
      console.error("Error updating role for OAuth user:", roleError);
    } finally {
      localStorage.removeItem("selectedRole");
    }
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        setLoading(true);

        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          if (!isEmailProvider(session.user)) {
            await updateOAuthUserRole(session.user.id);
          }

          try {
            await fetchUserProfile(session.user.id);
          } catch (profileError) {
            console.error(
              "Error fetching profile in getSession:",
              profileError
            );
          }
        }
      } catch (error) {
        console.error("Error in getSession:", error);
      } finally {
        setLoading(false);
      }
    };

    let isInitialized = false;

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isInitialized) {
        isInitialized = true;
        return;
      }

      try {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === "SIGNED_IN" && session?.user) {
          try {
            await fetchUserProfile(session.user.id);
            router.push("/");
          } catch (profileError) {
            console.error("Error fetching profile on sign in:", profileError);
          }
        } else if (event === "SIGNED_OUT") {
          setUserProfile(null);
          router.push("/");
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  const fetchUserProfile = async (userId: string) => {
    if (!userId) {
      console.warn("fetchUserProfile called without userId");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user profile:", error);
        throw error;
      }

      if (data) {
        setUserProfile(data);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserProfile(null);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
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

  const signInWithFacebook = async () => {
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

  const signInWithEmail = async (
    email: string,
    fullName: string,
    role: string
  ) => {
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

  const signInWithPassword = async (email: string, password: string) => {
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

  const updatePassword = async (password: string) => {
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

  const signOut = async () => {
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

  const refreshUserSession = async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.refreshSession();

      if (sessionError) {
        console.error("Error refreshing session:", sessionError);
        throw sessionError;
      } else if (session?.user) {
        setUser(session.user);
        setSession(session);

        await fetchUserProfile(session.user.id);
      }
    } catch (error) {
      console.error("Error refreshing user session:", error);
      throw error;
    }
  };

  const checkEmailExists = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking email existence:", error);
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error("Error checking email existence:", error);
      throw error;
    }
  };

  const checkEmailStatus = async (
    email: string
  ): Promise<EmailStatusResult> => {
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (userError && userError.code !== "PGRST116") {
        console.error("Error checking email in users table:", userError);
        throw userError;
      }

      if (!userData) {
        return { exists: false, verified: false };
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-confirmation-status`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ user_id: userData.id }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        return {
          exists: true,
          verified: !!result.email_confirmed_at,
          userId: userData.id,
        };
      } catch (functionError) {
        console.error("Error calling edge function:", functionError);
        return {
          exists: true,
          verified: false,
          userId: userData.id,
        };
      }
    } catch (error) {
      console.error("Error checking email status:", error);
      throw error;
    }
  };

  const checkUserRole = async (email: string): Promise<UserRoleResult> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking user role:", error);
        throw error;
      }

      if (!data) {
        return { exists: false };
      }

      return {
        exists: true,
        role: data.role as "traveler" | "owner",
      };
    } catch (error) {
      console.error("Error checking user role:", error);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    session,
    loading,
    signInWithGoogle,
    signInWithFacebook,
    signInWithEmail,
    signInWithPassword,
    updatePassword,
    refreshUserSession,
    checkEmailExists,
    checkEmailStatus,
    checkUserRole,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
