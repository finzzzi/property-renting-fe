import { RefObject } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

interface UploadAreaProps {
  selectedFile: File | null;
  previewUrl: string | null;
  error: string | null;
  uploading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
}

export function UploadArea({
  selectedFile,
  previewUrl,
  error,
  uploading,
  fileInputRef,
  onFileSelect,
  onRemoveFile,
}: UploadAreaProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="picture">Foto Room</Label>

      {!selectedFile ? (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Pilih file gambar untuk diupload
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, JPEG, PNG - Maksimal 2MB
              </p>
            </div>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={onFileSelect}
              className="mt-4"
              disabled={uploading}
            />
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-start gap-4">
            {previewUrl && (
              <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRemoveFile}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
