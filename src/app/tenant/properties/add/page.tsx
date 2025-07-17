"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building2, MapPinIcon, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import { usePropertyData } from "@/hooks/usePropertyData";
import { usePropertyForm } from "@/hooks/usePropertyForm";
import { PhotoUploader } from "@/components/tenant/properties/PhotoUploader";

export default function AddPropertyPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();

  const photoUpload = usePhotoUpload();
  const {
    categories,
    cities,
    loading: dataLoading,
    error: dataError,
  } = usePropertyData();
  const {
    formData,
    selectedCity,
    cityPopoverOpen,
    loading: formLoading,
    error: formError,
    showConfirmDialog,
    handleInputChange,
    handleCitySelect,
    setCityPopoverOpen,
    handleSubmit,
    handleConfirmSubmit,
    setShowConfirmDialog,
  } = usePropertyForm({
    mainPhoto: photoUpload.mainPhoto,
    additionalPhotos: photoUpload.additionalPhotos,
  });

  if (authLoading || dataLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>

        {/* Form Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Description field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-24 w-full" />
            </div>

            {/* Location field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Category field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* City field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Submit buttons */}
            <div className="flex justify-end space-x-4">
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium mb-2">Session Tidak Ditemukan</h3>
          <p className="text-muted-foreground mb-4">
            Silakan login kembali untuk mengakses halaman ini
          </p>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium mb-2">Error</h3>
          <p className="text-muted-foreground mb-4">{dataError}</p>
          <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tambah Properti Baru</h1>
          <p className="text-muted-foreground">
            Lengkapi form berikut untuk menambahkan properti baru
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Properti</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">{formError}</p>
              </div>
            )}

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  handleInputChange("category_id", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori properti" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Tidak ada kategori yang sesuai?{" "}
                <span className="text-blue-500">
                  <Link href="/tenant/categories">Buat custom kategori</Link>
                </span>
              </p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Properti *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Masukkan nama properti"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi *</Label>
              <Textarea
                id="description"
                placeholder="Masukkan deskripsi properti"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Lokasi *</Label>
              <Input
                id="location"
                type="text"
                placeholder="Masukkan alamat lengkap properti"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                required
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">Kota/Kabupaten *</Label>
              <Popover open={cityPopoverOpen} onOpenChange={setCityPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={cityPopoverOpen}
                    className="w-full justify-start"
                  >
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {selectedCity
                      ? `${selectedCity.type} ${selectedCity.name}`
                      : "Pilih kota/kabupaten"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0"
                  sideOffset={5}
                  style={{ width: "var(--radix-popover-trigger-width)" }}
                >
                  <Command>
                    <CommandInput placeholder="Cari kota/kabupaten" />
                    <CommandList>
                      <CommandEmpty>
                        Tidak ada kota/kabupaten ditemukan.
                      </CommandEmpty>
                      <CommandGroup>
                        {cities.map((city) => (
                          <CommandItem
                            key={city.id}
                            value={`${city.type} ${city.name}`}
                            onSelect={() => handleCitySelect(city)}
                          >
                            <span className="text-xs text-gray-500 mr-2">
                              {city.type}
                            </span>
                            {city.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Foto Properti */}
            <PhotoUploader {...photoUpload} />

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                disabled={formLoading}
                onClick={() =>
                  !formLoading && router.push("/tenant/properties")
                }
              >
                Batal
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Properti"
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
            <DialogTitle>Konfirmasi Tambah Properti</DialogTitle>
            <DialogDescription>
              Apakah data yang Anda masukkan sudah benar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={formLoading}
            >
              Batal
            </Button>
            <Button onClick={handleConfirmSubmit} disabled={formLoading}>
              {formLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Ya, Simpan Properti"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
