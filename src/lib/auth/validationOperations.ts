import { createClient } from "@/lib/supabase/client";
import { EmailStatusResult, UserRoleResult } from "./types";

export const checkEmailExists = async (email: string): Promise<boolean> => {
  const supabase = createClient();

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

export const checkEmailStatus = async (
  email: string
): Promise<EmailStatusResult> => {
  const supabase = createClient();

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
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-user-metadata`,
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
        exists: !!result.user?.email,
        verified: !!result.user?.user_metadata?.email_verified,
        userId: userData.id,
      };
    } catch (functionError) {
      console.error("Error calling edge function:", functionError);
      return {
        exists: false,
        verified: false,
        userId: userData.id,
      };
    }
  } catch (error) {
    console.error("Error checking email status:", error);
    throw error;
  }
};

export const checkUserRole = async (email: string): Promise<UserRoleResult> => {
  const supabase = createClient();

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
      role: data.role as "traveler" | "tenant",
    };
  } catch (error) {
    console.error("Error checking user role:", error);
    throw error;
  }
};

export const checkHasPassword = async (email: string): Promise<boolean> => {
  const supabase = createClient();

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
      return false;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-user-metadata`,
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

      return !!result.user?.app_metadata?.has_password;
    } catch (functionError) {
      console.error("Error calling edge function:", functionError);
      return false;
    }
  } catch (error) {
    console.error("Error checking has password:", error);
    throw error;
  }
};
