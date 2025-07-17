"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  onFileChange: (file: File | null) => void;
  file: File | null;
}

export function ImageUpload({ onFileChange, file }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validatePhoto = (file: File): string | null => {
    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(file.type)) return "Harus JPG/JPEG/PNG";
    if (file.size > 2 * 1024 * 1024) return "Ukuran maks 2MB";
    return null;
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validationError = validatePhoto(selectedFile);
    if (validationError) {
      setError(validationError);
      onFileChange(null);
      setPreview(null);
      return;
    }

    setError(null);
    onFileChange(selectedFile);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(URL.createObjectURL(selectedFile));
  };

  const removePhoto = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    onFileChange(null);
    setPreview(null);
  };

  return (
    <div className="space-y-2">
      <label>Foto Room</label>
      {file && preview ? (
        <div className="border rounded-lg p-4 flex items-start gap-4">
          <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted">
            <Image src={preview} alt="Preview" fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={removePhoto}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm">Pilih gambar JPG/JPEG/PNG (≤ 2MB)</p>
          <Input
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            className="mt-4"
            onChange={handlePhotoChange}
          />
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
