import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Category,
  City,
  Property,
  PropertyFormData,
  PropertyResponse,
  CategoryResponse,
} from "@/lib/types/tenant-property-types";

const supabase = createClient();

export const useEditProperty = () => {
  const params = useParams();
  const propertyId = params?.id as string;
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState<PropertyFormData>({
    name: "",
    description: "",
    location: "",
    category_id: "",
    city_id: "",
  });

  const [property, setProperty] = useState<Property | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [propertyLoading, setPropertyLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cityPopoverOpen, setCityPopoverOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Fetch Property Data
  useEffect(() => {
    const fetchProperty = async () => {
      if (!session?.access_token || !propertyId) return;
      try {
        setPropertyLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/tenant/properties/${propertyId}/edit`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Gagal mengambil data properti");
        const data: PropertyResponse = await response.json();
        setProperty(data.data);
        setFormData({
          name: data.data.name,
          description: data.data.description,
          location: data.data.location,
          category_id: data.data.category_id.toString(),
          city_id: data.data.city_id.toString(),
        });
      } catch (err) {
        setError("Gagal mengambil data properti");
      } finally {
        setPropertyLoading(false);
      }
    };
    if (session) fetchProperty();
  }, [session, propertyId]);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!session?.access_token) return;
      try {
        setCategoriesLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/tenant/categories?tenant_id=${session.user.id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Gagal mengambil data kategori");
        const data: CategoryResponse = await response.json();
        setCategories(data.data);
      } catch (err) {
        setError("Gagal mengambil data kategori");
      } finally {
        setCategoriesLoading(false);
      }
    };
    if (session) fetchCategories();
  }, [session]);

  // Fetch Cities
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setCitiesLoading(true);
        const { data: citiesData, error } = await supabase
          .from("cities")
          .select("*");
        if (error) throw error;
        setCities(citiesData || []);
      } catch (err) {
        setError("Gagal mengambil data kota");
      } finally {
        setCitiesLoading(false);
      }
    };
    fetchCities();
  }, []);

  // Set Selected City from fetched data
  useEffect(() => {
    if (cities.length > 0 && formData.city_id) {
      const matchedCity = cities.find(
        (c) => c.id === parseInt(formData.city_id)
      );
      if (matchedCity) setSelectedCity(matchedCity);
    }
  }, [cities, formData.city_id]);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setFormData((prev) => ({ ...prev, city_id: city.id.toString() }));
    setCityPopoverOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    if (!session?.access_token || !propertyId) return;

    setSubmitting(true);
    setError(null);
    setShowConfirmDialog(false);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenant/properties/${propertyId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            ...formData,
            category_id: parseInt(formData.category_id),
            city_id: parseInt(formData.city_id),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengupdate properti");
      }
      router.push("/tenant/properties");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan yang tidak diketahui"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return {
    formData,
    property,
    categories,
    cities,
    selectedCity,
    cityPopoverOpen,
    loading:
      propertyLoading || categoriesLoading || citiesLoading || authLoading,
    submitting,
    error,
    showConfirmDialog,
    session,
    handleInputChange,
    handleCitySelect,
    handleSubmit,
    handleConfirmSubmit,
    setCityPopoverOpen,
    setShowConfirmDialog,
    router,
  };
};
