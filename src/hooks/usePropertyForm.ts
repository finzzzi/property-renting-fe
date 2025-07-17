import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { City } from "./usePropertyData";

interface FormData {
  name: string;
  description: string;
  location: string;
  category_id: string;
  city_id: string;
}

interface PhotoFiles {
  mainPhoto: File | null;
  additionalPhotos: (File | null)[];
}

export const usePropertyForm = (photoFiles: PhotoFiles) => {
  const { session } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    location: "",
    category_id: "",
    city_id: "",
  });

  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [cityPopoverOpen, setCityPopoverOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setFormData((prev) => ({ ...prev, city_id: city.id.toString() }));
    setCityPopoverOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.access_token) {
      setError("Token authentikasi tidak ditemukan");
      return;
    }

    // Validation
    if (
      !formData.name ||
      !formData.description ||
      !formData.location ||
      !formData.category_id ||
      !formData.city_id
    ) {
      setError("Semua field harus diisi");
      return;
    }

    // Clear error and show confirmation dialog
    setError(null);
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmDialog(false);

    if (!session?.access_token) {
      setError("Token authentikasi tidak ditemukan");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenant/properties`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            location: formData.location,
            category_id: formData.category_id,
            city_id: formData.city_id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menambahkan properti");
      }

      const data = await response.json();
      const propertyId = data?.data?.id ?? data?.id ?? null;

      // Upload foto jika ada dan propertyId valid
      if (propertyId) {
        const uploadPhoto = async (file: File, isMain: boolean) => {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("isMain", isMain.toString());
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/pictures/properties/${propertyId}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
              body: fd,
            }
          );
        };

        if (photoFiles.mainPhoto) {
          await uploadPhoto(photoFiles.mainPhoto, true);
        }

        for (const file of photoFiles.additionalPhotos) {
          if (file) await uploadPhoto(file, false);
        }
      }

      // Redirect setelah semua selesai
      router.push("/tenant/properties");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    selectedCity,
    cityPopoverOpen,
    loading,
    error,
    showConfirmDialog,
    handleInputChange,
    handleCitySelect,
    setCityPopoverOpen,
    handleSubmit,
    handleConfirmSubmit,
    setShowConfirmDialog,
  };
};
