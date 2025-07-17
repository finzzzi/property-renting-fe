import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DateRange } from "react-day-picker";
import { PeakSeason } from "./usePeakSeasonDataV2";

export type PeakForm = {
  type: "percentage" | "fixed";
  value: string;
  range?: DateRange;
};

export const usePeakSeasonFormV2 = (
  selectedRoom: string,
  fetchPeakSeasons: () => Promise<void>
) => {
  const { session } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PeakSeason | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [pendingForm, setPendingForm] = useState<PeakForm | null>(null);
  const [editingSeason, setEditingSeason] = useState<PeakSeason | null>(null);

  // Helper functions
  const formatForApi = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  const formatInputValue = (val: string) => {
    const numeric = val.replace(/[^\d]/g, "");
    if (!numeric) return "";
    return new Intl.NumberFormat("id-ID").format(parseInt(numeric));
  };

  const handleValueChange = (val: string) => {
    if (!pendingForm) return;
    if (pendingForm.type === "fixed") {
      const raw = val.replace(/[^\d]/g, "");
      setPendingForm((f) => (f ? { ...f, value: raw } : null));
    } else {
      const raw = val.replace(/[^\d]/g, "");
      setPendingForm((f) => (f ? { ...f, value: raw } : null));
    }
  };

  // Dialog handlers
  const openAddDialog = () => {
    setPendingForm({ type: "percentage", value: "" });
    setShowAddDialog(true);
  };

  const openEditDialog = (ps: PeakSeason) => {
    setEditingSeason(ps);
    setPendingForm({
      type: ps.type,
      value: ps.value.toString(),
      range: { from: new Date(ps.start_date), to: new Date(ps.end_date) },
    });
    setShowEditDialog(true);
  };

  const openConfirm = () => {
    if (!pendingForm?.range?.from || !pendingForm.value) return;
    setShowAddDialog(false);
    setShowEditDialog(false);
    setShowConfirmDialog(true);
  };

  const closeDialogs = () => {
    setShowAddDialog(false);
    setShowEditDialog(false);
    setShowConfirmDialog(false);
    setDeleteTarget(null);
  };

  // CRUD operations
  const savePeakSeason = async () => {
    if (
      !session?.access_token ||
      !pendingForm ||
      !pendingForm.range?.from ||
      !selectedRoom
    )
      return;

    const body = {
      room_id: selectedRoom,
      type: pendingForm.type,
      value: Number(pendingForm.value),
      start_date: formatForApi(pendingForm.range.from),
      end_date: formatForApi(pendingForm.range.to ?? pendingForm.range.from),
    };

    const url = editingSeason
      ? `${apiUrl}/tenant/peak-seasons/${editingSeason.id}`
      : `${apiUrl}/tenant/peak-seasons`;
    const method = editingSeason ? "PUT" : "POST";

    try {
      setSubmitting(true);
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan data");
      setShowConfirmDialog(false);
      setEditingSeason(null);
      await fetchPeakSeasons();
    } catch (err) {
      setShowConfirmDialog(false);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!session?.access_token || !deleteTarget) return;
    try {
      setSubmitting(true);
      const res = await fetch(
        `${apiUrl}/tenant/peak-seasons/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menghapus data");
      setDeleteTarget(null);
      await fetchPeakSeasons();
    } catch (err) {
      setDeleteTarget(null);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    // Dialog states
    showAddDialog,
    showEditDialog,
    showConfirmDialog,
    deleteTarget,
    submitting,
    setDeleteTarget,

    // Form states
    pendingForm,
    setPendingForm,
    editingSeason,

    // Handlers
    handleValueChange,
    formatInputValue,
    openAddDialog,
    openEditDialog,
    openConfirm,
    closeDialogs,
    savePeakSeason,
    handleDelete,
  };
};
