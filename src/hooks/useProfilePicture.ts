import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const useProfilePicture = (
  onSuccess: () => void,
  userProfile: { profile_picture?: string | null } | null
) => {
  const { session } = useAuth();
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({
    error: "",
    success: "",
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validasi file
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setStatusMessage({
        error: "Format file tidak didukung. Gunakan JPG, PNG, atau GIF.",
        success: "",
      });
      return;
    }

    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      setStatusMessage({
        error: "Ukuran file terlalu besar. Maksimal 1MB.",
        success: "",
      });
      return;
    }

    setIsUploadLoading(true);
    setStatusMessage({ error: "", success: "" });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pictures/profile/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setStatusMessage({
          success: "Foto profil berhasil diupload",
          error: "",
        });
        onSuccess(); // Callback to trigger reload
      } else {
        setStatusMessage({
          error: data.message || "Gagal mengupload foto profil",
          success: "",
        });
      }
    } catch (error: any) {
      console.error("Error uploading profile picture:", error);
      setStatusMessage({
        error: "Terjadi kesalahan saat mengupload foto profil",
        success: "",
      });
    } finally {
      setIsUploadLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!userProfile?.profile_picture) return;

    setIsDeleteLoading(true);
    setStatusMessage({ error: "", success: "" });
    setShowDeleteDialog(false);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pictures/profile/delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setStatusMessage({
          success: "Foto profil berhasil dihapus",
          error: "",
        });
        onSuccess();
      } else {
        setStatusMessage({
          error: data.message || "Gagal menghapus foto profil",
          success: "",
        });
      }
    } catch (error: any) {
      console.error("Error deleting profile picture:", error);
      setStatusMessage({
        error: "Terjadi kesalahan saat menghapus foto profil",
        success: "",
      });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return {
    isUploadLoading,
    isDeleteLoading,
    statusMessage,
    showDeleteDialog,
    setShowDeleteDialog,
    fileInputRef,
    handleUploadClick,
    handleFileUpload,
    handleDeleteProfilePicture,
  };
};
