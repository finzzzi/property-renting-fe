import { User, Session } from "@supabase/supabase-js";

export interface UserProfile {
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

export interface EmailStatusResult {
  exists: boolean;
  verified: boolean;
  userId?: string;
}

export interface UserRoleResult {
  exists: boolean;
  role?: "traveler" | "owner";
}

export interface AuthContextType {
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
  checkHasPassword: (email: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  updatePasswordWithToken: (newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
}
