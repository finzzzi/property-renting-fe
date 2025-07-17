import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Upload, X } from "lucide-react";

interface PhotoUploaderProps {
  mainPhoto: File | null;
  mainPreview: string | null;
  additionalPhotos: (File | null)[];
  additionalPreviews: (string | null)[];
  photoErrors: {
    main?: string;
    additional: (string | null)[];
  };
  handleMainPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeMainPhoto: () => void;
  handleAdditionalPhotoChange: (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  removeAdditionalPhoto: (idx: number) => void;
}

export const PhotoUploader = ({
  mainPhoto,
  mainPreview,
  additionalPhotos,
  additionalPreviews,
  photoErrors,
  handleMainPhotoChange,
  removeMainPhoto,
  handleAdditionalPhotoChange,
  removeAdditionalPhoto,
}: PhotoUploaderProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Foto Properti</h3>
        <p className="text-sm text-muted-foreground">
          Setiap properti memiliki 1 foto utama dan hingga 4 foto tambahan
        </p>
      </div>

      {/* Foto Utama */}
      <div className="space-y-2">
        <Label>Foto Utama</Label>
        {mainPhoto ? (
          <div className="border rounded-lg p-4 flex items-start gap-4">
            {mainPreview && (
              <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted">
                <Image
                  src={mainPreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{mainPhoto.name}</p>
              <p className="text-xs text-muted-foreground">
                {(mainPhoto.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={removeMainPhoto}
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
              onChange={handleMainPhotoChange}
            />
          </div>
        )}
        {photoErrors.main && (
          <p className="text-sm text-red-600">{photoErrors.main}</p>
        )}
      </div>

      {/* Foto Tambahan */}
      <div className="space-y-2">
        <Label>Foto Tambahan</Label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {additionalPhotos.map((file, idx) => (
            <div key={idx} className="space-y-2">
              {file ? (
                <div className="border rounded-lg p-4 flex items-start gap-4">
                  {additionalPreviews[idx] && (
                    <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                      <Image
                        src={additionalPreviews[idx]!}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAdditionalPhoto(idx)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    onChange={(e) => handleAdditionalPhotoChange(idx, e)}
                  />
                </div>
              )}
              {photoErrors.additional[idx] && (
                <p className="text-xs text-red-600">
                  {photoErrors.additional[idx]}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
