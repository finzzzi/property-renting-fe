"use client";

import { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Upload, Loader2, Camera, X, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

interface Property {
  id: number;
  name: string;
  address: string;
}

interface PropertyResponse {
  success: boolean;
  message: string;
  data: Property[];
}

interface UploadResponse {
  success: boolean;
  data: {
    id: number;
    file_path: string;
    public_url: string;
    is_main: boolean;
    created_at: string;
  };
}

interface ErrorResponse {
  success: false;
  message: string;
}

interface FormData {
  property_id: string;
  file: File | null;
  is_main: boolean;
}

export default function AddPropertyPicturePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState<FormData>({
    property_id: "",
    file: null,
    is_main: false,
  });

  const [formErrors, setFormErrors] = useState<{
    property_id?: string;
    file?: string;
  }>({});

  useEffect(() => {
    if (session) {
      fetchProperties();
    }
  }, [session]);

  // Pre-select property from query parameter
  useEffect(() => {
    const propertyId = searchParams.get("property_id");
    if (propertyId && properties.length > 0) {
      setFormData((prev) => ({
        ...prev,
        property_id: propertyId,
      }));
    }
  }, [searchParams, properties]);

  const fetchProperties = async () => {
    if (!session?.access_token) {
      setError("Token authentikasi tidak ditemukan");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/properties/my-properties?all=true`,
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
            "Token tidak valid atau sudah expired. Silakan login kembali."
          );
        }
        throw new Error(`Gagal mengambil data properti: ${response.status}`);
      }

      const data: PropertyResponse = await response.json();
      setProperties(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file: File): string | null => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      return "File harus berupa gambar JPG, JPEG, atau PNG";
    }

    if (file.size > 2 * 1024 * 1024) {
      // 2MB
      return "Ukuran file maksimal 2MB";
    }

    return null;
  };

  const validateForm = (): boolean => {
    const errors: { property_id?: string; file?: string } = {};

    if (!formData.property_id) {
      errors.property_id = "Properti wajib dipilih";
    }

    if (!formData.file) {
      errors.file = "File gambar wajib dipilih";
    } else {
      const fileError = validateFile(formData.file);
      if (fileError) {
        errors.file = fileError;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePropertyChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      property_id: value,
    }));

    if (formErrors.property_id) {
      setFormErrors((prev) => ({
        ...prev,
        property_id: undefined,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileError = validateFile(file);
    if (fileError) {
      setFormErrors((prev) => ({
        ...prev,
        file: fileError,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      file,
    }));

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Clear file error
    if (formErrors.file) {
      setFormErrors((prev) => ({
        ...prev,
        file: undefined,
      }));
    }
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({
      ...prev,
      file: null,
    }));

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleIsMainChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      is_main: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!session?.access_token) {
      setError("Token authentikasi tidak ditemukan");
      return;
    }

    // Clear error and show confirmation dialog
    setError(null);
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmDialog(false);

    if (!session?.access_token || !formData.file) {
      setError("Token authentikasi tidak ditemukan atau file tidak valid");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const uploadFormData = new FormData();
      uploadFormData.append("file", formData.file);
      uploadFormData.append("isMain", formData.is_main.toString());

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pictures/properties/${formData.property_id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: uploadFormData,
        }
      );

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.message || "Gagal mengupload foto");
      }

      const data: UploadResponse = await response.json();

      // Cleanup preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      // Redirect to gallery page
      router.push("/tenant/gallery/properties");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-10 w-24" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && properties.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/tenant/gallery/properties">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Tambah Foto Properti
            </h1>
            <p className="text-muted-foreground">
              Upload foto untuk properti Anda
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Terjadi Kesalahan</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => fetchProperties()} variant="outline">
                Coba Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/tenant/gallery/properties">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tambah Foto Properti
          </h1>
          <p className="text-muted-foreground">
            Upload foto untuk properti Anda
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Informasi Foto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Property Selection */}
            <div className="space-y-2">
              <Label htmlFor="property">Properti</Label>
              <Select
                value={formData.property_id}
                onValueChange={handlePropertyChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih properti" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem
                      key={property.id}
                      value={property.id.toString()}
                    >
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.property_id && (
                <p className="text-sm text-red-600">{formErrors.property_id}</p>
              )}
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">Foto Properti</Label>

              {!formData.file ? (
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
                      id="file"
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      onChange={handleFileChange}
                      className="mt-4"
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
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {formErrors.file && (
                <p className="text-sm text-red-600">{formErrors.file}</p>
              )}
            </div>

            {/* Is Main Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                id="is_main"
                type="checkbox"
                checked={formData.is_main}
                onChange={(e) => handleIsMainChange(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-muted-foreground rounded"
              />
              <Label
                htmlFor="is_main"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Jadikan sebagai foto utama properti
              </Label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button variant="outline" asChild>
                <Link href="/tenant/gallery/properties">Batal</Link>
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengupload...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Foto
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Upload</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin mengupload foto ini?
              {formData.is_main &&
                " Foto ini akan menjadi foto utama properti."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Batal
            </Button>
            <Button onClick={handleConfirmSubmit}>
              <Check className="mr-2 h-4 w-4" />
              Ya, Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
