"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAvailability } from "@/hooks/useAvailability";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Building2 } from "lucide-react";
import { DateRange } from "react-day-picker";

import PageHeader from "@/components/tenant/PageHeader";
import { PropertyRoomFilter } from "@/components/tenant/PropertyRoomFilter";
import { AvailabilityCalendar } from "@/components/tenant/availability/AvailabilityCalendar";
import { UnavailabilityTable } from "@/components/tenant/availability/UnavailabilityTable";
import { AddUnavailabilityDialog } from "@/components/tenant/availability/AddUnavailabilityDialog";
import { ConfirmActionDialog } from "@/components/tenant/availability/ConfirmActionDialog";
import { ErrorDialog } from "@/components/tenant/availability/ErrorDialog";

import type { Unavailability } from "@/lib/types/tenant";

export default function AvailabilityPage() {
  const { session, loading: authLoading } = useAuth();
  const {
    properties,
    rooms,
    unavailabilities,
    selectedProperty,
    setSelectedProperty,
    selectedRoom,
    setSelectedRoom,
    month,
    setMonth,
    loading,
    error,
    setError,
    fetchUnavailabilities,
    fetcher,
  } = useAvailability();

  const [dialogs, setDialogs] = useState({
    add: false,
    confirmDelete: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Unavailability | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleAddUnavailability = async (range: DateRange) => {
    if (!range.from || !selectedRoom) return;

    const formatForApi = (d: Date) => d.toISOString().split("T")[0];

    setSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/tenant/unavailabilities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          room_id: selectedRoom,
          start_date: formatForApi(range.from),
          end_date: formatForApi(range.to ?? range.from),
        }),
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Gagal memproses error response" }));
        throw new Error(errorData.message || "Gagal menambahkan data.");
      }
      await fetchUnavailabilities();
      setDialogs((prev) => ({ ...prev, add: false }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambahkan data.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        `${apiUrl}/tenant/unavailabilities/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Gagal memproses error response" }));
        throw new Error(errorData.message || "Gagal menghapus data.");
      }
      await fetchUnavailabilities();
      setDeleteTarget(null);
      setDialogs((prev) => ({ ...prev, confirmDelete: false }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus data.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div>
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium mb-2">Sesi Tidak Ditemukan</h3>
          <p className="text-muted-foreground">
            Silakan login untuk mengakses halaman ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Ketersediaan Room"
          description="Atur tanggal-tanggal saat room tidak tersedia untuk dipesan."
          backHref="/tenant"
        />

        <Button
          onClick={() => setDialogs((prev) => ({ ...prev, add: true }))}
          disabled={!selectedRoom}
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah Unavailability
        </Button>
      </div>

      <PropertyRoomFilter
        properties={properties}
        rooms={rooms}
        selectedProperty={selectedProperty}
        selectedRoom={selectedRoom}
        onPropertyChange={setSelectedProperty}
        onRoomChange={setSelectedRoom}
        isLoadingRooms={loading.rooms}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <AvailabilityCalendar
            unavailabilities={unavailabilities}
            month={month}
            onMonthChange={setMonth}
            isLoading={loading.unavailabilities}
            isRoomSelected={!!selectedRoom}
          />
        </div>
        {selectedRoom && (
          <div className="lg:col-span-2">
            <UnavailabilityTable
              unavailabilities={unavailabilities}
              onDelete={(item) => {
                setDeleteTarget(item);
                setDialogs((prev) => ({ ...prev, confirmDelete: true }));
              }}
              month={month}
            />
          </div>
        )}
      </div>

      <AddUnavailabilityDialog
        open={dialogs.add}
        onOpenChange={(open) => setDialogs((prev) => ({ ...prev, add: open }))}
        onSubmit={handleAddUnavailability}
        isSubmitting={submitting}
        selectedRoomId={selectedRoom}
        rooms={rooms}
      />

      {deleteTarget && (
        <ConfirmActionDialog
          open={dialogs.confirmDelete}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
            setDialogs((prev) => ({ ...prev, confirmDelete: open }));
          }}
          onConfirm={handleDelete}
          isSubmitting={submitting}
          title="Hapus Unavailability"
          description={`Anda yakin ingin menghapus jadwal ini?`}
          variant="destructive"
          confirmText="Ya, Hapus"
        />
      )}

      {error && (
        <ErrorDialog
          open={!!error}
          onOpenChange={() => setError(null)}
          message={error}
        />
      )}
    </div>
  );
}
