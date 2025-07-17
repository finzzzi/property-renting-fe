import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import {
  Room,
  RoomFormData,
  RoomResponse,
} from "@/lib/types/tenant-room-types";

export const useEditRoom = () => {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [formData, setFormData] = useState<RoomFormData>({
    name: "",
    description: "",
    price: "",
    max_guests: "",
    quantity: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<RoomFormData>>({});

  const fetchRoomData = async () => {
    if (!session?.access_token) {
      setError("Token otentikasi tidak ditemukan");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenant/rooms/${roomId}/edit`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Token tidak valid atau sudah kedaluwarsa. Silakan login kembali."
          );
        }
        if (response.status === 404) {
          throw new Error("Room tidak ditemukan");
        }
        throw new Error(`Gagal mengambil data room: ${response.status}`);
      }

      const data: RoomResponse = await response.json();
      const roomData = data.data;

      setRoom(roomData);
      setFormData({
        name: roomData.name,
        description: roomData.description,
        price: roomData.price.toString(),
        max_guests: roomData.max_guests.toString(),
        quantity: roomData.quantity.toString(),
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && roomId) {
      fetchRoomData();
    }
  }, [session, roomId]);

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

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof RoomFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setError(null);
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!session?.access_token) {
      setError("Token otentikasi tidak ditemukan");
      return;
    }

    setShowConfirmDialog(false);
    setSubmitting(true);
    setError(null);

    try {
      const requestBody = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        max_guests: parseInt(formData.max_guests),
        quantity: parseInt(formData.quantity),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenant/rooms/${roomId}`,
        {
          method: "PUT",
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
          errorData.message || `Gagal mengupdate room: ${response.status}`
        );
      }
      router.push("/tenant/rooms");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "");
    if (!numericValue) return "";
    return new Intl.NumberFormat("id-ID").format(parseInt(numericValue));
  };

  const handlePriceChange = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "");
    handleInputChange("price", numericValue);
  };

  return {
    room,
    loading,
    submitting,
    error,
    showConfirmDialog,
    setShowConfirmDialog,
    authLoading,
    session,
    formData,
    formErrors,
    handleInputChange,
    handleSubmit,
    handleConfirmSubmit,
    fetchRoomData,
    formatPrice,
    handlePriceChange,
    router,
  };
};
