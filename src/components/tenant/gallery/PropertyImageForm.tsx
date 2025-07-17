"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Upload, Loader2, X } from "lucide-react";
import Image from "next/image";
import type { Property, PropertyImageFormData } from "@/lib/types/tenant";

interface PropertyImageFormProps {
  properties: Property[];
  formData: PropertyImageFormData;
  setFormData: React.Dispatch<React.SetStateAction<PropertyImageFormData>>;
  formErrors: { property_id?: string; file?: string };
  previewUrl: string | null;
  onFileChange: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  error: string | null;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export function PropertyImageForm({
  properties,
  formData,
  setFormData,
  formErrors,
  previewUrl,
  onFileChange,
  onSubmit,
  isSubmitting,
  error,
}: PropertyImageFormProps) {
  const router = useRouter();

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Informasi Foto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="property">Properti</Label>
            <Select
              value={formData.property_id}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, property_id: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih properti" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.property_id && (
              <p className="text-sm text-red-600">{formErrors.property_id}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Foto Properti</Label>
            {!formData.file ? (
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm font-medium">
                  Pilih file gambar untuk diupload
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, JPEG, PNG - Maksimal 2MB
                </p>
                <Input
                  id="file"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                  className="mt-4"
                />
              </div>
            ) : (
              <div className="border rounded-lg p-4 flex items-start gap-4">
                {previewUrl && (
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={80}
                    height={80}
                    className="rounded-md object-cover bg-muted"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {formData.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(formData.file.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onFileChange(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {formErrors.file && (
              <p className="text-sm text-red-600">{formErrors.file}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="is_main"
              type="checkbox"
              checked={formData.is_main}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, is_main: e.target.checked }))
              }
              className="h-4 w-4 rounded"
            />
            <Label htmlFor="is_main">Jadikan sebagai foto utama properti</Label>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={() => router.push("/tenant/gallery/properties")}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Mengupload...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" /> Upload Foto
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
