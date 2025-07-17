"use client";

import { useState, Suspense } from "react";
import { useRoomGallery } from "@/hooks/useRoomGallery";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

import PageHeader from "@/components/tenant/PageHeader";
import { PropertyFilter } from "@/components/tenant/gallery/PropertyFilter";
import { GalleryEmptyState } from "@/components/tenant/gallery/GalleryEmptyState";
import { RoomGalleryTable } from "@/components/tenant/gallery/RoomGalleryTable";
import { ConfirmActionDialog } from "@/components/tenant/availability/ConfirmActionDialog";
import { ErrorDialog } from "@/components/tenant/availability/ErrorDialog";

import type { RoomWithPictures } from "@/lib/types/tenant";

function GallerySkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-10 w-1/2" />
      <Card>
        <CardContent className="p-0">
          <div className="p-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full mt-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RoomGalleryContent() {
  const {
    properties,
    rooms,
    selectedProperty,
    setSelectedProperty,
    loading,
    error,
    setError,
    emptyMessage,
    deleteRoomPicture,
    fetchRooms,
  } = useRoomGallery();

  const [deleting, setDeleting] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<RoomWithPictures | null>(
    null
  );

  const handleDelete = async () => {
    if (!roomToDelete || roomToDelete.pictures.length === 0) return;
    setDeleting(true);
    const success = await deleteRoomPicture(roomToDelete.pictures[0].id);
    if (success) {
      setRoomToDelete(null);
    }
    setDeleting(false);
  };

  if (loading.properties) {
    return <GallerySkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Galeri Foto Room"
        description="Kelola foto-foto untuk setiap room di properti Anda."
        backHref="/tenant"
      />

      <PropertyFilter
        properties={properties}
        selectedValue={selectedProperty}
        onValueChange={setSelectedProperty}
        isLoading={loading.properties}
      />

      {selectedProperty && (
        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border">
          <p>
            Setiap room hanya dapat memiliki <strong>1 foto</strong>.
          </p>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading.rooms ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
            </div>
          ) : !selectedProperty ? (
            <GalleryEmptyState status="initial" />
          ) : error ? (
            <GalleryEmptyState
              status="error"
              message={error}
              onRetry={fetchRooms}
            />
          ) : rooms.length === 0 ? (
            <GalleryEmptyState
              status="empty"
              message={emptyMessage || undefined}
            />
          ) : (
            <RoomGalleryTable
              rooms={rooms}
              selectedPropertyId={selectedProperty}
              onDelete={(room) => setRoomToDelete(room)}
            />
          )}
        </CardContent>
      </Card>

      {roomToDelete && (
        <ConfirmActionDialog
          open={!!roomToDelete}
          onOpenChange={(open) => !open && setRoomToDelete(null)}
          onConfirm={handleDelete}
          isSubmitting={deleting}
          title="Konfirmasi Hapus Foto"
          description={`Anda yakin ingin menghapus foto untuk room "${roomToDelete.name}"?`}
          variant="destructive"
          confirmText="Ya, Hapus"
        />
      )}

      {error && !loading.rooms && (
        <ErrorDialog
          open={!!error}
          onOpenChange={() => setError(null)}
          message={error}
        />
      )}
    </div>
  );
}

export default function RoomGalleryPage() {
  return (
    <Suspense fallback={<GallerySkeleton />}>
      <RoomGalleryContent />
    </Suspense>
  );
}
