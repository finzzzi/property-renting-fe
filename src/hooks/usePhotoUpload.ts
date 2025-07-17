import { useState } from "react";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export const usePhotoUpload = () => {
  const [mainPhoto, setMainPhoto] = useState<File | null>(null);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [additionalPhotos, setAdditionalPhotos] = useState<(File | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [additionalPreviews, setAdditionalPreviews] = useState<
    (string | null)[]
  >([null, null, null, null]);
  const [photoErrors, setPhotoErrors] = useState<{
    main?: string;
    additional: (string | null)[];
  }>({ additional: [null, null, null, null] });

  const validatePhoto = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return "Harus JPG/JPEG/PNG";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Ukuran maks 2MB";
    }
    return null;
  };

  const handleMainPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const err = validatePhoto(file);
    if (err) {
      setPhotoErrors((prev) => ({ ...prev, main: err }));
      return;
    }

    setMainPhoto(file);
    setMainPreview(URL.createObjectURL(file));
    setPhotoErrors((prev) => ({ ...prev, main: undefined }));
  };

  const removeMainPhoto = () => {
    if (mainPreview) URL.revokeObjectURL(mainPreview);
    setMainPhoto(null);
    setMainPreview(null);
    setPhotoErrors((prev) => ({ ...prev, main: undefined }));
  };

  const handleAdditionalPhotoChange = (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const err = validatePhoto(file);
    setPhotoErrors((prev) => {
      const add = [...prev.additional];
      add[idx] = err;
      return { ...prev, additional: add };
    });

    if (err) return;

    setAdditionalPhotos((prev) => {
      const copy = [...prev];
      copy[idx] = file;
      return copy;
    });

    setAdditionalPreviews((prev) => {
      const copy = [...prev];
      if (copy[idx]) URL.revokeObjectURL(copy[idx]!);
      copy[idx] = URL.createObjectURL(file);
      return copy;
    });
  };

  const removeAdditionalPhoto = (idx: number) => {
    setAdditionalPhotos((prev) => {
      const copy = [...prev];
      copy[idx] = null;
      return copy;
    });

    setAdditionalPreviews((prev) => {
      const copy = [...prev];
      if (copy[idx]) URL.revokeObjectURL(copy[idx]!);
      copy[idx] = null;
      return copy;
    });

    setPhotoErrors((prev) => {
      const add = [...prev.additional];
      add[idx] = null;
      return { ...prev, additional: add };
    });
  };

  return {
    mainPhoto,
    mainPreview,
    additionalPhotos,
    additionalPreviews,
    photoErrors,
    handleMainPhotoChange,
    removeMainPhoto,
    handleAdditionalPhotoChange,
    removeAdditionalPhoto,
  };
};
