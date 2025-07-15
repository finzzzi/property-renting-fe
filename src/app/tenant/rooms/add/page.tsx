"use client";

import { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Save, Building2, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

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

interface RoomFormData {
  name: string;
  description: string;
  price: string;
  max_guests: string;
  quantity: string;
  property_id: string;
}

export default function AddRoomPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<RoomFormData>({
    name: "",
    description: "",
    price: "",
    max_guests: "",
    quantity: "",
    property_id: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<RoomFormData>>({});

  useEffect(() => {
    if (session) {
      fetchProperties();
    }
  }, [session]);

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

  const validateForm = (): boolean => {
    const errors: Partial<RoomFormData> = {};

    if (!formData.name.trim()) {
      errors.name = "Nama room wajib diisi";
    }

    if (!formData.description.trim()) {
      errors.description = "Deskripsi wajib diisi";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = "Harga harus lebih dari 0";
    }

    if (!formData.max_guests || parseInt(formData.max_guests) <= 0) {
      errors.max_guests = "Jumlah tamu maksimal harus lebih dari 0";
    }

    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      errors.quantity = "Jumlah room harus lebih dari 0";
    }

    if (!formData.property_id) {
      errors.property_id = "Properti wajib dipilih";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof RoomFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
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

    if (!session?.access_token) {
      setError("Token authentikasi tidak ditemukan");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const requestBody = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        max_guests: parseInt(formData.max_guests),
        quantity: parseInt(formData.quantity),
        property_id: parseInt(formData.property_id),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/properties/rooms/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Token tidak valid atau sudah expired. Silakan login kembali."
          );
        }
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Gagal membuat room: ${response.status}`
        );
      }

      // Redirect to rooms list on success
      router.push("/tenant/rooms");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d]/g, "");

    if (!numericValue) return "";

    // Format as currency
    return new Intl.NumberFormat("id-ID").format(parseInt(numericValue));
  };

  const handlePriceChange = (value: string) => {
    // Store raw numeric value
    const numericValue = value.replace(/[^\d]/g, "");
    setFormData((prev) => ({
      ...prev,
      price: numericValue,
    }));

    // Clear error
    if (formErrors.price) {
      setFormErrors((prev) => ({
        ...prev,
        price: undefined,
      }));
    }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
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
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
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

  if (error && properties.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium mb-2">Terjadi Kesalahan</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchProperties()}>Coba Lagi</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/tenant/rooms">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Tambah Room Baru</h1>
          <p className="text-muted-foreground">
            Buat room baru untuk properti Anda
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Room</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Selection */}
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

            {/* Room Name */}
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

            {/* Description */}
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

            {/* Price */}
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

            {/* Max Guests and Quantity */}
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

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
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

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Tambah Room</DialogTitle>
            <DialogDescription>
              Apakah data yang Anda masukkan sudah benar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button onClick={handleConfirmSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Ya, Simpan Room"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
