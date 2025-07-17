"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, ArrowLeft, Loader2, ImageIcon } from "lucide-react";
import { useRoomUpload } from "@/hooks/useRoomUpload";
import { UploadArea } from "@/components/tenant/rooms/UploadArea";
import {
  ConfirmationDialog,
  SuccessDialog,
} from "@/components/tenant/rooms/RoomUploadDialogs";

export default function RoomUploadPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  // Unwrap params using React.use()
  const { roomId } = use(params);
  const searchParams = useSearchParams();

  // Get room info from query parameters
  const roomName = searchParams.get("roomName") || "Room";
  const propertyName = searchParams.get("propertyName") || "Properti";
  const propertyId = searchParams.get("propertyId") || "";

  const {
    selectedFile,
    previewUrl,
    uploading,
    showConfirmDialog,
    showSuccessDialog,
    error,
    fileInputRef,
    handleFileSelect,
    handleRemoveFile,
    handleSubmit,
    handleConfirmUpload,
    handleSuccessClose,
    handleBack,
    setShowConfirmDialog,
    setShowSuccessDialog,
  } = useRoomUpload(roomId, propertyId);

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
            <UploadArea
              selectedFile={selectedFile}
              previewUrl={previewUrl}
              error={error}
              uploading={uploading}
              fileInputRef={fileInputRef}
              onFileSelect={handleFileSelect}
              onRemoveFile={handleRemoveFile}
            />

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
      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmUpload}
        uploading={uploading}
        roomName={roomName}
      />

      {/* Success Dialog */}
      <SuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        onClose={handleSuccessClose}
      />
    </div>
  );
}
