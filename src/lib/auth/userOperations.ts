import { createClient } from "@/lib/supabase/client";
import { UserProfile } from "./types";

export const fetchUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  const supabase = createClient();

  if (!userId) {
    console.warn("fetchUserProfile called without userId");
    return null;
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

    return data || null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};
