"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

import { useRoomForm } from "@/hooks/useRoomForm";
import { ImageUpload } from "@/components/tenant/ImageUpload";
import { ConfirmationDialog } from "@/components/tenant/ConfirmationDialog";
import { Property } from "@/lib/types/tenant";
import { useState } from "react";

interface RoomFormProps {
  properties: Property[];
}

export function RoomForm({ properties }: RoomFormProps) {
  const router = useRouter();
  const {
    formData,
    formErrors,
    handleInputChange,
    validateForm,
    submitting,
    error,
    handleConfirmSubmit,
  } = useRoomForm();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const formatPrice = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "");
    if (!numericValue) return "";
    return new Intl.NumberFormat("id-ID").format(parseInt(numericValue));
  };

  const handlePriceChange = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "");
    handleInputChange("price", numericValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setShowConfirmDialog(true);
    } else {
    }
  };

  const handleConfirm = () => {
    handleConfirmSubmit(photoFile);
    setShowConfirmDialog(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Informasi Room</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="property_id">
                Properti <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.property_id}
                onValueChange={(value) =>
                  handleInputChange("property_id", value)
                }
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
                      <div>
                        <div className="font-medium">{property.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {property.address}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.property_id && (
                <p className="text-sm text-red-500">{formErrors.property_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Nama Room <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Contoh: Deluxe Room"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Deskripsi <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Deskripsi room..."
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
              />
              {formErrors.description && (
                <p className="text-sm text-red-500">{formErrors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">
                Harga per Malam <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  Rp
                </span>
                <Input
                  id="price"
                  type="text"
                  className="pl-8"
                  value={formatPrice(formData.price)}
                  onChange={(e) => handlePriceChange(e.target.value)}
                />
              </div>
              {formErrors.price && (
                <p className="text-sm text-red-500">{formErrors.price}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_guests">
                  Tamu Maksimal <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="max_guests"
                  type="number"
                  min="1"
                  value={formData.max_guests}
                  onChange={(e) =>
                    handleInputChange("max_guests", e.target.value)
                  }
                />
                {formErrors.max_guests && (
                  <p className="text-sm text-red-500">
                    {formErrors.max_guests}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Room Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    handleInputChange("quantity", e.target.value)
                  }
                />
                {formErrors.quantity && (
                  <p className="text-sm text-red-500">{formErrors.quantity}</p>
                )}
              </div>
            </div>

            <ImageUpload onFileChange={setPhotoFile} file={photoFile} />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={() => !submitting && router.push("/tenant/rooms")}
              >
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Room"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirm}
        title="Konfirmasi Tambah Room"
        description="Apakah data yang Anda masukkan sudah benar?"
        isSubmitting={submitting}
      />
    </>
  );
}
