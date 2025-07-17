import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface UploadResponse {
  success: boolean;
  message: string;
  data?: any;
}

export function useRoomUpload(roomId: string, propertyId: string) {
  const { session } = useAuth();
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setError("Format file harus JPG, JPEG, atau PNG");
      return;
    }

    // Validate file size (2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      setError("Ukuran file maksimal 2MB");
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Silakan pilih file foto terlebih dahulu");
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile || !session?.access_token) return;

    try {
      setUploading(true);
      setShowConfirmDialog(false);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pictures/rooms/${roomId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      const data: UploadResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal mengupload foto");
      }

      setShowSuccessDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setUploading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    // Cleanup
    handleRemoveFile();
    // Navigate back to gallery with property selected
    router.push(`/tenant/gallery/rooms?property=${propertyId}`);
  };

  const handleBack = () => {
    // Cleanup preview URL if exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    router.push(`/tenant/gallery/rooms?property=${propertyId}`);
  };

  return {
    // State
    selectedFile,
    previewUrl,
    uploading,
    showConfirmDialog,
    showSuccessDialog,
    error,
    fileInputRef,

    // Actions
    handleFileSelect,
    handleRemoveFile,
    handleSubmit,
    handleConfirmUpload,
    handleSuccessClose,
    handleBack,
    setShowConfirmDialog,
    setShowSuccessDialog,
  };
}
