"use client";

import { useState, useRef, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, ArrowLeft, Loader2, ImageIcon, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface UploadResponse {
  success: boolean;
  message: string;
  data?: any;
}

export default function RoomUploadPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  // Unwrap params using React.use()
  const { roomId } = use(params);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { session } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get room info from query parameters
  const roomName = searchParams.get("roomName") || "Room";
  const propertyName = searchParams.get("propertyName") || "Properti";
  const propertyId = searchParams.get("propertyId") || "";

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Upload Foto Room
          </h1>
          <p className="text-muted-foreground">
            Upload foto untuk room: <strong>{roomName}</strong> di{" "}
            <strong>{propertyName}</strong>
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Upload Foto Room
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
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
                      onChange={handleFileSelect}
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
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={uploading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={!selectedFile || uploading}
                className=""
              >
                {uploading ? (
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
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Upload</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin mengupload foto untuk room{" "}
              <strong>{roomName}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={uploading}
            >
              Batal
            </Button>
            <Button onClick={handleConfirmUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengupload...
                </>
              ) : (
                "Ya, Upload"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              Upload Berhasil
            </DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleSuccessClose} className="w-full">
              Kembali ke Galeri
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
