"use client";

import { useState } from "react";
import { Plus, Loader2, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { usePeakSeasonDataV2 } from "@/hooks/usePeakSeasonDataV2";
import { usePeakSeasonFormV2 } from "@/hooks/usePeakSeasonFormV2";
import { PropertyRoomFilter } from "@/components/tenant/PropertyRoomFilter";
import { PeakSeasonCalendarV2 } from "@/components/tenant/peak-seasons/PeakSeasonCalendarV2";
import { PeakSeasonTableV2 } from "@/components/tenant/peak-seasons/PeakSeasonTableV2";
import { PeakSeasonDialogV2 } from "@/components/tenant/peak-seasons/PeakSeasonDialogV2";
import { PeakSeasonConfirmDialogsV2 } from "@/components/tenant/peak-seasons/PeakSeasonConfirmDialogsV2";

export default function PeakSeasonsPage() {
  const { session, loading: authLoading } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    properties,
    rooms,
    selectedProperty,
    selectedRoom,
    month,
    peakSeasons,
    loadingData,
    peakDates,
    setSelectedProperty,
    setSelectedRoom,
    setMonth,
    fetchPeakSeasons,
  } = usePeakSeasonDataV2();

  const {
    showAddDialog,
    showEditDialog,
    showConfirmDialog,
    deleteTarget,
    submitting,
    setDeleteTarget,
    pendingForm,
    setPendingForm,
    editingSeason,
    handleValueChange,
    formatInputValue,
    openAddDialog,
    openEditDialog,
    openConfirm,
    closeDialogs,
    savePeakSeason,
    handleDelete,
  } = usePeakSeasonFormV2(selectedRoom, fetchPeakSeasons);

  // Handle save with error handling
  const handleSave = async () => {
    try {
      await savePeakSeason();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan");
    }
  };

  // Handle delete with error handling
  const handleDeleteWithError = async () => {
    try {
      await handleDelete();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan");
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
      <div className="flex items-center justify-center h-64">
        <Building2 className="h-12 w-12 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Peak Seasons</h1>
          <p className="text-muted-foreground">
            Atur tanggal & harga khusus musim ramai
          </p>
        </div>
        <Button onClick={openAddDialog} disabled={!selectedRoom}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Peak Season
        </Button>
      </div>

      {/* Filters */}
      <PropertyRoomFilter
        properties={properties}
        rooms={rooms}
        selectedProperty={selectedProperty}
        selectedRoom={selectedRoom}
        onPropertyChange={setSelectedProperty}
        onRoomChange={setSelectedRoom}
      />

      {/* Kalender & Tabel (berdampingan pada layar lg ke atas) */}
      <div className="flex flex-col lg:flex-row lg:gap-8">
        {/* Bagian Kalender */}
        <div className="lg:w-1/4">
          <PeakSeasonCalendarV2
            month={month}
            onMonthChange={setMonth}
            peakDates={peakDates}
            loadingData={loadingData}
            selectedRoom={selectedRoom}
          />
        </div>

        {/* Bagian Tabel */}
        <PeakSeasonTableV2
          peakSeasons={peakSeasons}
          rooms={rooms}
          month={month}
          selectedRoom={selectedRoom}
          loadingData={loadingData}
          onEdit={openEditDialog}
          onDelete={setDeleteTarget}
        />
      </div>

      {/* Add / Edit Dialog */}
      <PeakSeasonDialogV2
        showAddDialog={showAddDialog}
        showEditDialog={showEditDialog}
        pendingForm={pendingForm}
        selectedRoom={selectedRoom}
        rooms={rooms}
        onClose={closeDialogs}
        onFormChange={setPendingForm}
        onSave={openConfirm}
        formatInputValue={formatInputValue}
        handleValueChange={handleValueChange}
      />

      {/* Confirmation Dialogs */}
      <PeakSeasonConfirmDialogsV2
        showConfirmDialog={showConfirmDialog}
        deleteTarget={deleteTarget}
        errorMessage={errorMessage}
        submitting={submitting}
        onConfirmSave={handleSave}
        onConfirmDelete={handleDeleteWithError}
        onCloseConfirm={closeDialogs}
        onCloseDelete={() => setDeleteTarget(null)}
        onCloseError={() => setErrorMessage(null)}
      />
    </div>
  );
}
