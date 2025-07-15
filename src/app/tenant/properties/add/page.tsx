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
import {
  Building2,
  MapPinIcon,
  ArrowLeft,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

interface Category {
  id: number;
  name: string;
  tenant_id?: string | null;
}

interface City {
  id: number;
  type: string;
  name: string;
}

interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category[];
  total: number;
}

interface FormData {
  name: string;
  description: string;
  location: string;
  category_id: string;
  city_id: string;
}

export default function AddPropertyPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    location: "",
    category_id: "",
    city_id: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [cityPopoverOpen, setCityPopoverOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();

  // ====== STATE UNTUK UPLOAD FOTO ======
  const [mainPhoto, setMainPhoto] = useState<File | null>(null);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [additionalPhotos, setAdditionalPhotos] = useState<(File | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [additionalPreviews, setAdditionalPreviews] = useState<
    (string | null)[]
  >([null, null, null, null]);
  const [photoErrors, setPhotoErrors] = useState<{
    main?: string;
    additional: (string | null)[];
  }>({ additional: [null, null, null, null] });

  const validatePhoto = (file: File): string | null => {
    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(file.type)) return "Harus JPG/JPEG/PNG";
    if (file.size > 2 * 1024 * 1024) return "Ukuran maks 2MB";
    return null;
  };

  const handleMainPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validatePhoto(file);
    if (err) {
      setPhotoErrors((prev) => ({ ...prev, main: err }));
      return;
    }
    setMainPhoto(file);
    setMainPreview(URL.createObjectURL(file));
    setPhotoErrors((prev) => ({ ...prev, main: undefined }));
  };

  const removeMainPhoto = () => {
    if (mainPreview) URL.revokeObjectURL(mainPreview);
    setMainPhoto(null);
    setMainPreview(null);
  };

  const handleAdditionalPhotoChange = (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validatePhoto(file);
    setPhotoErrors((prev) => {
      const add = [...prev.additional];
      add[idx] = err;
      return { ...prev, additional: add };
    });
    if (err) return;

    setAdditionalPhotos((prev) => {
      const copy = [...prev];
      copy[idx] = file;
      return copy;
    });

    setAdditionalPreviews((prev) => {
      const copy = [...prev];
      copy[idx] = URL.createObjectURL(file);
      return copy;
    });
  };

  const removeAdditionalPhoto = (idx: number) => {
    setAdditionalPhotos((prev) => {
      const copy = [...prev];
      copy[idx] = null;
      return copy;
    });
    setAdditionalPreviews((prev) => {
      const copy = [...prev];
      if (copy[idx]) URL.revokeObjectURL(copy[idx]!);
      copy[idx] = null;
      return copy;
    });
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!session?.access_token) return;

      try {
        setCategoriesLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/properties/categories?tenant_id=${session.user.id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Gagal mengambil data kategori");
        }

        const data: CategoryResponse = await response.json();
        setCategories(data.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Gagal mengambil data kategori");
      } finally {
        setCategoriesLoading(false);
      }
    };

    if (session) {
      fetchCategories();
    }
  }, [session]);

  // Fetch cities
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setCitiesLoading(true);
        const { data: citiesData } = await supabase.from("cities").select("*");
        setCities(citiesData || []);
      } catch (err) {
        console.error("Error fetching cities:", err);
        setError("Gagal mengambil data kota");
      } finally {
        setCitiesLoading(false);
      }
    };

    fetchCities();
  }, []);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setFormData((prev) => ({
      ...prev,
      city_id: city.id.toString(),
    }));
    setCityPopoverOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.access_token) {
      setError("Token authentikasi tidak ditemukan");
      return;
    }

    // Validation
    if (
      !formData.name ||
      !formData.description ||
      !formData.location ||
      !formData.category_id ||
      !formData.city_id
    ) {
      setError("Semua field harus diisi");
      return;
    }

    // Clear error and show confirmation dialog
    setError(null);
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmDialog(false);

    if (!session?.access_token) {
      setError("Token authentikasi tidak ditemukan");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/properties/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            location: formData.location,
            category_id: formData.category_id,
            city_id: formData.city_id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menambahkan properti");
      }

      const data = await response.json();
      const propertyId = data?.data?.id ?? data?.id ?? null;

      // Upload foto jika ada dan propertyId valid
      if (propertyId) {
        const uploadPhoto = async (file: File, isMain: boolean) => {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("isMain", isMain.toString());
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/pictures/properties/${propertyId}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
              body: fd,
            }
          );
        };

        if (mainPhoto) {
          await uploadPhoto(mainPhoto, true);
        }

        for (const file of additionalPhotos) {
          if (file) await uploadPhoto(file, false);
        }
      }

      // Redirect setelah semua selesai
      router.push("/tenant/properties");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || categoriesLoading || citiesLoading) {
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
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">{error}</p>
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
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Foto Properti</h3>
                <p className="text-sm text-muted-foreground">
                  Setiap properti memiliki 1 foto utama dan hingga 4 foto
                  tambahan
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
                      <p className="text-sm font-medium truncate">
                        {mainPhoto.name}
                      </p>
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
                            <p className="text-xs font-medium truncate">
                              {file.name}
                            </p>
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
                            onChange={(e) =>
                              handleAdditionalPhotoChange(idx, e)
                            }
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

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => !loading && router.push("/tenant/properties")}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
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
              disabled={loading}
            >
              Batal
            </Button>
            <Button onClick={handleConfirmSubmit} disabled={loading}>
              {loading ? (
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
