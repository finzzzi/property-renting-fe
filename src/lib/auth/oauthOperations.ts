import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export const isEmailProvider = (user: User): boolean => {
  return user.app_metadata?.provider === "email";
};

export const updateOAuthUserRole = async (userId: string): Promise<void> => {
  const supabase = createClient();
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
