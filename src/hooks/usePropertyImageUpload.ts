"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type {
  PropertyImageFormData,
  UploadResponse,
  ErrorResponse,
  Property,
} from "@/lib/types/tenant";

export function usePropertyImageUpload() {
  const { session } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [properties, setProperties] = useState<Property[]>([]);
  const [formData, setFormData] = useState<PropertyImageFormData>({
    property_id: searchParams.get("property_id") || "",
    file: null,
    is_main: false,
  });
  const [formErrors, setFormErrors] = useState<{
    property_id?: string;
    file?: string;
  }>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!session) return;
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/tenant/properties?all=true`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error("Gagal mengambil data properti.");
        const data = await res.json();
        setProperties(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [session, apiUrl]);

  const validateFile = (file: File): string | null => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type))
      return "File harus berupa gambar JPG, JPEG, atau PNG.";
    if (file.size > 2 * 1024 * 1024) return "Ukuran file maksimal 2MB.";
    return null;
  };

  const validateForm = (): boolean => {
    const errors: { property_id?: string; file?: string } = {};
    if (!formData.property_id) errors.property_id = "Properti wajib dipilih.";
    if (!formData.file) {
      errors.file = "File gambar wajib dipilih.";
    } else {
      const fileError = validateFile(formData.file);
      if (fileError) errors.file = fileError;
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileChange = (file: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    if (file) {
      const fileError = validateFile(file);
      if (fileError) {
        setFormErrors((prev) => ({ ...prev, file: fileError }));
        setFormData((prev) => ({ ...prev, file: null }));
        setPreviewUrl(null);
        return;
      }
      setFormData((prev) => ({ ...prev, file }));
      setPreviewUrl(URL.createObjectURL(file));
      if (formErrors.file)
        setFormErrors((prev) => ({ ...prev, file: undefined }));
    } else {
      setFormData((prev) => ({ ...prev, file: null }));
      setPreviewUrl(null);
    }
  };

  const handleConfirmSubmit = async (): Promise<boolean> => {
    if (!validateForm() || !formData.file) return false;

    setSubmitting(true);
    setError(null);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", formData.file);
      uploadFormData.append("isMain", formData.is_main.toString());

      const response = await fetch(
        `${apiUrl}/pictures/properties/${formData.property_id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${session?.access_token}` },
          body: uploadFormData,
        }
      );

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.message || "Gagal mengupload foto.");
      }

      return true; // Success
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      return false; // Failure
    } finally {
      setSubmitting(false);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    }
  };

  return {
    properties,
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    previewUrl,
    loading,
    submitting,
    error,
    setError,
    validateForm,
    handleFileChange,
    handleConfirmSubmit,
  };
}
