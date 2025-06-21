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

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
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
          const role = localStorage.getItem("selectedRole");
          if (role) {
            try {
              const { data: existingUser } = await supabase
                .from("users")
                .select("role")
                .eq("id", session.user.id)
                .single();

              if (!existingUser?.role) {
                await supabase.auth.updateUser({ data: { role } });
                await supabase
                  .from("users")
                  .update({ role })
                  .eq("id", session.user.id);
                localStorage.removeItem("selectedRole");
                console.log("Role updated:", role);
              } else {
                localStorage.removeItem("selectedRole");
                console.log(
                  "Role sudah ada, tidak perlu update:",
                  existingUser.role
                );
              }
            } catch (roleError) {
              console.error("Error updating role:", roleError);
              localStorage.removeItem("selectedRole");
            }
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

  const value = {
    user,
    userProfile,
    session,
    loading,
    signInWithGoogle,
    signInWithFacebook,
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
