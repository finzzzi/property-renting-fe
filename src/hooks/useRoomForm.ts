"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { RoomFormData } from "@/lib/types/tenant";

export function useRoomForm() {
  const { session } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<RoomFormData>({
    name: "",
    description: "",
    price: "",
    max_guests: "",
    quantity: "",
    property_id: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<RoomFormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const errors: Partial<RoomFormData> = {};
    if (!formData.name.trim()) errors.name = "Nama room wajib diisi";
    if (!formData.description.trim())
      errors.description = "Deskripsi wajib diisi";
    if (!formData.price || parseFloat(formData.price) <= 0)
      errors.price = "Harga harus lebih dari 0";
    if (!formData.max_guests || parseInt(formData.max_guests) <= 0)
      errors.max_guests = "Jumlah tamu maksimal harus lebih dari 0";
    if (!formData.quantity || parseInt(formData.quantity) <= 0)
      errors.quantity = "Jumlah room harus lebih dari 0";
    if (!formData.property_id) errors.property_id = "Properti wajib dipilih";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof RoomFormData, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      return newData;
    });
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleConfirmSubmit = async (photoFile: File | null) => {
    if (!session?.access_token) {
      setError("Token otentikasi tidak ditemukan.");
      return;
    }

    // Hapus validasi duplikat karena sudah divalidasi di RoomForm
    // if (!validateForm()) {
    //   return;
    // }

    setSubmitting(true);
    setError(null);

    try {
      const requestBody = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        max_guests: parseInt(formData.max_guests),
        quantity: parseInt(formData.quantity),
        property_id: parseInt(formData.property_id),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenant/rooms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Gagal membuat room: ${response.status}`
        );
      }

      const data = await response.json();
      const roomId = data?.data?.id ?? data?.id ?? null;

      if (roomId && photoFile) {
        const fd = new FormData();
        fd.append("file", photoFile);
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/pictures/rooms/${roomId}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` },
            body: fd,
          }
        ).catch((e) => console.error("Upload foto room gagal", e));
      }

      router.push("/tenant/rooms");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    formData,
    formErrors,
    submitting,
    error,
    handleInputChange,
    handleConfirmSubmit,
    validateForm,
    setFormData,
  };
}
