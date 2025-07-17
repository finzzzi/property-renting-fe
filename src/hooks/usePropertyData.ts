import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface Category {
  id: number;
  name: string;
  tenant_id?: string | null;
}

export interface City {
  id: number;
  type: string;
  name: string;
}

interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category[];
  total: number;
}

export const usePropertyData = () => {
  const { session } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch categories and cities in parallel
        const [categoriesResponse, citiesResponse] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/tenant/categories?tenant_id=${session.user.id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
            }
          ),
          supabase.from("cities").select("*"),
        ]);

        if (!categoriesResponse.ok) {
          throw new Error("Gagal mengambil data kategori");
        }
        const categoriesData: CategoryResponse =
          await categoriesResponse.json();
        setCategories(categoriesData.data);

        if (citiesResponse.error) {
          throw new Error("Gagal mengambil data kota");
        }
        setCities(citiesResponse.data || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan yang tidak diketahui"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  return { categories, cities, loading, error };
};
