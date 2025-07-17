"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  MoreHorizontal,
  Trash2,
  Loader2,
  Camera,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
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
import PageHeader from "@/components/tenant/PageHeader";
import { PropertyFilter } from "@/components/tenant/gallery/PropertyFilter";
import { usePropertyGalleryPage } from "@/hooks/usePropertyGalleryPage";
import { Suspense } from "react";

function PropertyGalleryContent() {
  const {
    pictures,
    properties,
    loading,
    loadingProperties,
    authLoading,
    error,
    session,
    selectedProperty,
    setSelectedProperty,
    showDeleteDialog,
    submitting,
    openDeleteDialog,
    closeDeleteDialog,
    handleDeletePicture,
    fetchPictures,
  } = usePropertyGalleryPage();

  // Check if current property has reached max photos (5)
  const isMaxPhotosReached = pictures.length >= 5;

  const renderContent = () => {
    if (authLoading || loadingProperties) {
      return <PropertyGallerySkeleton />;
    }

    if (!session) {
      return <AuthRequiredState type="login" />;
    }

    if (!selectedProperty) {
      return <AuthRequiredState type="select" />;
    }

    if (loading) {
      return <PropertyGallerySkeleton />;
    }

    if (error) {
      return <ErrorState message={error} onRetry={fetchPictures} />;
    }

    if (pictures.length === 0) {
      return <EmptyState propertyId={selectedProperty} />;
    }

    return (
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Foto</TableHead>
                <TableHead>Properti</TableHead>
                <TableHead className="w-32 text-center">Foto Utama</TableHead>
                <TableHead className="w-16 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pictures.map((pic) => (
                <TableRow key={pic.id}>
                  <TableCell>
                    <div className="relative h-16 w-16 rounded-md overflow-hidden">
                      <Image
                        src={pic.public_url}
                        alt={`Foto properti ${pic.property.name}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {pic.property.name}
                  </TableCell>
                  <TableCell className="text-center">
                    {pic.is_main ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-primary-700">
                        <Check className="h-3 w-3" />
                        Ya
                      </span>
                    ) : (
                      <span className="text-gray-400"></span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(pic)}
                          className="text-red-500"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Galeri Foto Properti"
        description="Kelola semua foto untuk properti Anda."
      >
        <Button
          asChild={!isMaxPhotosReached}
          disabled={isMaxPhotosReached}
          title={isMaxPhotosReached ? "Maksimal 5 foto per properti" : ""}
        >
          {isMaxPhotosReached ? (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Foto
            </>
          ) : (
            <Link
              href={`/tenant/gallery/properties/add${
                selectedProperty ? `?property_id=${selectedProperty}` : ""
              }`}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Foto
            </Link>
          )}
        </Button>
      </PageHeader>

      <PropertyFilter
        properties={properties}
        selectedValue={selectedProperty}
        onValueChange={setSelectedProperty}
        isLoading={loadingProperties}
      />

      {selectedProperty && (
        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border">
          <p>
            Setiap properti hanya dapat memiliki <strong>1 foto utama</strong>{" "}
            dan <strong>4 foto tambahan</strong>.
            {isMaxPhotosReached && (
              <span className="text-amber-600 font-medium">
                {" "}
                Batas maksimal foto telah tercapai ({pictures.length}/5).
              </span>
            )}
          </p>
        </div>
      )}

      {renderContent()}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={closeDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Foto?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat diurungkan. Apakah Anda yakin ingin
              menghapus foto ini?
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PropertyGalleryPage() {
  return (
    <Suspense fallback={<PropertyGallerySkeleton />}>
      <PropertyGalleryContent />
    </Suspense>
  );
}

function PropertyGallerySkeleton() {
  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {[...Array(4)].map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-16 w-16 rounded-md" />
                </TableCell>
                {[...Array(3)].map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AuthRequiredState({ type }: { type: "login" | "select" }) {
  const messages = {
    login: {
      title: "Akses Ditolak",
      description: "Silakan login untuk melihat galeri foto.",
      button: <Link href="/login">Login</Link>,
    },
    select: {
      title: "Pilih Properti",
      description: "Pilih properti dari daftar di atas untuk melihat fotonya.",
      button: null,
    },
  };
  const { title, description, button } = messages[type];
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center h-96 gap-4 text-center">
        <Camera className="w-12 h-12 text-muted-foreground" />
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
        {button && <Button asChild>{button}</Button>}
      </CardContent>
    </Card>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center h-96 gap-4 text-center">
        <ImageIcon className="w-12 h-12 text-red-500" />
        <h3 className="text-xl font-semibold">Gagal Memuat Foto</h3>
        <p className="text-muted-foreground">{message}</p>
        <Button onClick={onRetry}>Coba Lagi</Button>
      </CardContent>
    </Card>
  );
}

function EmptyState({ propertyId }: { propertyId: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center h-96 gap-4 text-center">
        <Camera className="w-12 h-12 text-muted-foreground" />
        <h3 className="text-xl font-semibold">Galeri Kosong</h3>
        <p className="text-muted-foreground">
          Belum ada foto untuk properti ini.
        </p>
        <Button asChild>
          <Link
            href={`/tenant/gallery/properties/add?property_id=${propertyId}`}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Foto
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
