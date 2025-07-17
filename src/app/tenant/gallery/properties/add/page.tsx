"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { usePropertyImageUpload } from "@/hooks/usePropertyImageUpload";
import { useAuth } from "@/contexts/AuthContext";

import PageHeader from "@/components/tenant/PageHeader";
import { PropertyImageForm } from "@/components/tenant/gallery/PropertyImageForm";
import { LoadingSkeleton } from "@/components/tenant/LoadingSkeleton";
import { ConfirmActionDialog } from "@/components/tenant/availability/ConfirmActionDialog";
import { SuccessDialog } from "@/components/tenant/gallery/SuccessDialog";

function AddPropertyPicturePageContent() {
  const { loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    properties,
    formData,
    setFormData,
    formErrors,
    previewUrl,
    loading,
    submitting,
    error,
    setError,
    validateForm,
    handleFileChange,
    handleConfirmSubmit,
  } = usePropertyImageUpload();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirm = async () => {
    setShowConfirmDialog(false);
    const success = await handleConfirmSubmit();
    if (success) {
      setShowSuccessDialog(true);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    // Redirect dengan property_id sebagai parameter untuk auto-select
    const propertyId = formData.property_id;
    router.push(`/tenant/gallery/properties?property_id=${propertyId}`);
  };

  if (authLoading || loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Foto Properti"
        description="Upload foto untuk properti Anda"
        backHref="/tenant/gallery/properties"
      />

      <PropertyImageForm
        properties={properties}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        previewUrl={previewUrl}
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        error={error}
      />

      <ConfirmActionDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirm}
        isSubmitting={submitting}
        title="Konfirmasi Upload"
        description={`Anda yakin ingin mengupload foto ini${
          formData.is_main ? " dan menjadikannya foto utama" : ""
        }?`}
        confirmText="Ya, Upload"
      />

      <SuccessDialog
        open={showSuccessDialog}
        onClose={handleSuccessClose}
        title="Upload Berhasil!"
        buttonText="Kembali ke Galeri"
      />
    </div>
  );
}

export default function AddPropertyPicturePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AddPropertyPicturePageContent />
    </Suspense>
  );
}
