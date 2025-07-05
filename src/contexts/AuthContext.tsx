"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// Import modular operations
import {
  AuthContextType,
  UserProfile,
  signInWithGoogle,
  signInWithFacebook,
  signInWithEmail,
  signInWithPassword,
  updatePassword,
  refreshUserSession,
  signOut,
  fetchUserProfile,
  checkEmailExists,
  checkEmailStatus,
  checkUserRole,
  checkHasPassword,
  isEmailProvider,
  updateOAuthUserRole,
  resetPassword,
  updatePasswordWithToken,
} from "@/lib/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Helper function untuk menghandle user profile
  const handleUserProfile = async (userId: string) => {
    try {
      const profile = await fetchUserProfile(userId);
      setUserProfile(profile);
    } catch (profileError) {
      console.error("Error fetching profile:", profileError);
      setUserProfile(null);
    }
  };

  // Helper function untuk getSession
  const getSession = async () => {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Update OAuth user role jika bukan email provider
        if (!isEmailProvider(session.user)) {
          await updateOAuthUserRole(session.user.id);
        }

        // Fetch user profile
        await handleUserProfile(session.user.id);

        // Initial redirect check untuk tenant
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          const excludedPaths = [
            "/reset-password",
            "/profile",
            "/auth/callback",
          ];
          const isExcludedPath = excludedPaths.some((path) =>
            currentPath.includes(path)
          );

          if (!isExcludedPath) {
            try {
              const userProfile = await fetchUserProfile(session.user.id);
              if (userProfile?.role === "tenant" && currentPath === "/") {
                router.push("/tenant");
              }
            } catch (error) {
              console.error(
                "Error checking user profile for initial redirect:",
                error
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in getSession:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk auth state change
  const handleAuthStateChange = async (
    event: string,
    session: Session | null
  ) => {
    try {
      setSession(session);
      setUser(session?.user ?? null);

      if (event === "SIGNED_IN" && session?.user) {
        const profile = await handleUserProfile(session.user.id);

        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/reset-password") &&
          !window.location.pathname.includes("/profile")
        ) {
          // Redirect berdasarkan role user
          try {
            const userProfile = await fetchUserProfile(session.user.id);
            if (userProfile?.role === "tenant") {
              router.push("/tenant");
            } else {
              router.push("/");
            }
          } catch (error) {
            console.error("Error fetching user profile for redirect:", error);
            router.push("/");
          }
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
  };

  useEffect(() => {
    let isInitialized = false;

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isInitialized) {
        isInitialized = true;
        return;
      }

      await handleAuthStateChange(event, session);
    });

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  // Wrapper functions untuk menyediakan context yang sama
  const handleUpdatePassword = async (password: string) => {
    await updatePassword(user, password);
  };

  const handleRefreshUserSession = async () => {
    const session = await refreshUserSession();
    if (session?.user) {
      setUser(session.user);
      setSession(session);
      await handleUserProfile(session.user.id);
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
    updatePassword: handleUpdatePassword,
    refreshUserSession: handleRefreshUserSession,
    checkEmailExists,
    checkEmailStatus,
    checkUserRole,
    checkHasPassword,
    resetPassword,
    updatePasswordWithToken,
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
