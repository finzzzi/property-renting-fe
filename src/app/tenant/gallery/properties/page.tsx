"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  MoreHorizontal,
  Trash2,
  Loader2,
  Camera,
  Check,
  Filter,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface PropertyPicture {
  id: number;
  property_id: number;
  file_path: string;
  is_main: boolean;
  created_at: string;
  public_url: string;
  property: {
    id: number;
    name: string;
    location: string;
  };
}

interface Property {
  id: number;
  name: string;
  location: string;
}

interface PicturesResponse {
  success: boolean;
  data: PropertyPicture[];
}

interface DeleteResponse {
  success: boolean;
  data: {
    message: string;
  };
}

export default function PropertyGalleryPage() {
  const [pictures, setPictures] = useState<PropertyPicture[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session, loading: authLoading } = useAuth();
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingPicture, setDeletingPicture] =
    useState<PropertyPicture | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (session) {
      fetchProperties();
    }
  }, [session]);

  useEffect(() => {
    if (session && selectedProperty) {
      fetchPictures();
    }
  }, [selectedProperty]);

  const fetchProperties = async () => {
    if (!session?.access_token) {
      setLoadingProperties(false);
      return;
    }

    try {
      setLoadingProperties(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenant/properties?all=true`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Gagal mengambil data properti: ${response.status}`);
      }

      const data = await response.json();
      setProperties(data.data);
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setLoadingProperties(false);
    }
  };

  const fetchPictures = async () => {
    if (!session?.access_token || !selectedProperty) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Build URL with property_id filter
      const url = `${process.env.NEXT_PUBLIC_API_URL}/pictures/all-property-pictures?property_id=${selectedProperty}`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Token tidak valid atau sudah expired. Silakan login kembali."
          );
        }
        throw new Error(`Gagal mengambil data gambar: ${response.status}`);
      }

      const data: PicturesResponse = await response.json();
      setPictures(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyFilterChange = (value: string) => {
    setSelectedProperty(value);
    setPictures([]); // Reset pictures when changing property
    setError(null); // Clear any previous errors
  };

  const handleDeletePicture = async () => {
    if (!session?.access_token || !deletingPicture) return;

    try {
      setSubmitting(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pictures/property/${deletingPicture.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menghapus foto");
      }

      const data: DeleteResponse = await response.json();

      // Refresh pictures list
      await fetchPictures();
      setShowDeleteDialog(false);
      setDeletingPicture(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteDialog = (picture: PropertyPicture) => {
    setDeletingPicture(picture);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeletingPicture(null);
  };

  if (authLoading || (loading && selectedProperty)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-48" />
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">No.</TableHead>
                  <TableHead className="w-24">Foto</TableHead>
                  <TableHead>Properti</TableHead>
                  <TableHead className="w-24 text-center">Foto Utama</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-16 w-16 rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-4 w-4 mx-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Galeri Foto Properti
            </h1>
            <p className="text-muted-foreground">
              Kelola gambar-gambar properti Anda
            </p>
          </div>
          <Button asChild={pictures.length < 5} disabled={pictures.length >= 5}>
            {pictures.length < 5 ? (
              <Link
                href={`/tenant/gallery/properties/add${
                  selectedProperty ? `?property_id=${selectedProperty}` : ""
                }`}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Foto Properti
              </Link>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Foto Properti
              </>
            )}
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Terjadi Kesalahan</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => fetchPictures()} variant="outline">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Galeri Foto Properti
          </h1>
          <p className="text-muted-foreground">
            Kelola gambar-gambar properti Anda
          </p>
        </div>
        <Button asChild={pictures.length < 5} disabled={pictures.length >= 5}>
          {pictures.length < 5 ? (
            <Link
              href={`/tenant/gallery/properties/add${
                selectedProperty ? `?property_id=${selectedProperty}` : ""
              }`}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Foto Properti
            </Link>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Foto Properti
            </>
          )}
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Pilih Properti:</span>
        </div>
        <Select
          value={selectedProperty}
          onValueChange={handlePropertyFilterChange}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Pilih properti untuk melihat foto" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id.toString()}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Info text */}
      {selectedProperty && (
        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border">
          <p>
            Setiap properti dapat memiliki maksimal <strong>5 foto</strong> (1
            foto utama + 4 foto tambahan).{" "}
            {pictures.length > 0 && (
              <span>
                Saat ini: <strong>{pictures.length}/5 foto</strong>
                {pictures.length >= 5 && (
                  <span className="text-amber-600 font-medium">
                    {" "}
                    - Batas maksimal tercapai
                  </span>
                )}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {!selectedProperty ? (
            <div className="text-center py-12">
              <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Pilih Properti</h3>
              <p className="text-muted-foreground mb-4">
                Silakan pilih properti dari dropdown di atas untuk melihat
                foto-foto yang tersedia.
              </p>
            </div>
          ) : pictures.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Belum Ada Foto</h3>
              <p className="text-muted-foreground mb-4">
                Belum ada foto yang diupload untuk properti yang dipilih.
              </p>
              <Button
                asChild={pictures.length < 5}
                disabled={pictures.length >= 5}
              >
                {pictures.length < 5 ? (
                  <Link
                    href={`/tenant/gallery/properties/add${
                      selectedProperty ? `?property_id=${selectedProperty}` : ""
                    }`}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Foto Pertama
                  </Link>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Foto Pertama
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">No.</TableHead>
                  <TableHead className="w-24">Foto</TableHead>
                  <TableHead>Properti</TableHead>
                  <TableHead className="w-24 text-center">Foto Utama</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pictures.map((picture, index) => (
                  <TableRow key={picture.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                        <Image
                          src={picture.public_url}
                          alt={`Foto ${picture.property.name}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {picture.property.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {picture.property.location}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {picture.is_main && (
                        <Check className="h-4 w-4 text-green-600 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(picture)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus Foto
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Foto</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus foto ini? Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDeleteDialog}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePicture}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
