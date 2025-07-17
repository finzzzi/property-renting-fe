import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DateRange } from "react-day-picker";

// These types should eventually be centralized
interface PeakSeason {
  id: number;
  room_id: number;
  type: "percentage" | "fixed";
  value: number;
  start_date: string;
  end_date: string;
}

type PeakForm = {
  type: "percentage" | "fixed";
  value: string;
  range?: DateRange;
};

// Helper, can be moved to utils
const formatForApi = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

export const usePeakSeasonForm = (
  selectedRoom: string,
  onSuccess: () => void // Callback to refresh data
) => {
  const { session } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [form, setForm] = useState<PeakForm | null>(null);
  const [editingSeason, setEditingSeason] = useState<PeakSeason | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PeakSeason | null>(null);

  const [dialogs, setDialogs] = useState({
    add: false,
    edit: false,
    confirmSave: false,
    confirmDelete: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openAddDialog = () => {
    setForm({ type: "percentage", value: "", range: undefined });
    setEditingSeason(null);
    setDialogs({ ...dialogs, add: true });
  };

  const openEditDialog = (ps: PeakSeason) => {
    setEditingSeason(ps);
    setForm({
      type: ps.type,
      value: String(ps.value),
      range: { from: new Date(ps.start_date), to: new Date(ps.end_date) },
    });
    setDialogs({ ...dialogs, edit: true });
  };

  const openConfirmDeleteDialog = (ps: PeakSeason) => {
    setDeleteTarget(ps);
    setDialogs({ ...dialogs, confirmDelete: true });
  };

  const closeAllDialogs = () => {
    setDialogs({
      add: false,
      edit: false,
      confirmSave: false,
      confirmDelete: false,
    });
    setForm(null);
    setEditingSeason(null);
    setDeleteTarget(null);
    setError(null);
  };

  const handleFormChange = (newForm: Partial<PeakForm>) => {
    if (!form) return;
    setForm({ ...form, ...newForm });
  };

  const handleSave = () => {
    if (!form?.range?.from || !form.value) {
      setError("Tanggal dan nilai harus diisi.");
      return;
    }
    setDialogs({
      add: false,
      edit: false,
      confirmSave: true,
      confirmDelete: false,
    });
  };

  const confirmSave = async () => {
    if (!session?.access_token || !form || !form.range?.from || !selectedRoom)
      return;

    const body = {
      room_id: selectedRoom,
      type: form.type,
      value: Number(form.value),
      start_date: formatForApi(form.range.from),
      end_date: formatForApi(form.range.to ?? form.range.from),
    };

    const url = editingSeason
      ? `${apiUrl}/tenant/peak-seasons/${editingSeason.id}`
      : `${apiUrl}/tenant/peak-seasons`;
    const method = editingSeason ? "PUT" : "POST";

    setSubmitting(true);
    setError(null);

    try {
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

      closeAllDialogs();
      onSuccess(); // Trigger data refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setDialogs({ ...dialogs, confirmSave: false }); // Keep the main dialog open to show error
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!session?.access_token || !deleteTarget) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `${apiUrl}/tenant/peak-seasons/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menghapus data");

      closeAllDialogs();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setDialogs({ ...dialogs, confirmDelete: false });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    dialogs,
    submitting,
    error,
    editingSeason,
    deleteTarget,
    handleFormChange,
    openAddDialog,
    openEditDialog,
    openConfirmDeleteDialog,
    closeAllDialogs,
    handleSave,
    confirmSave,
    confirmDelete,
    setError,
  };
};
