"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Building2,
  Filter,
  Plus,
  Trash2,
  Edit,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

interface Property {
  id: number;
  name: string;
}
interface Room {
  id: number;
  name: string;
  price?: number; // harga dasar kamar (opsional jika API belum menyertakan)
}
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
  value: string; // keep as string for input
  range?: DateRange;
};

export default function PeakSeasonsPage() {
  const { session, loading: authLoading } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");

  const [month, setMonth] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const [peakSeasons, setPeakSeasons] = useState<PeakSeason[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingRange, setPendingRange] = useState<DateRange | undefined>();
  const [pendingForm, setPendingForm] = useState<PeakForm | null>(null);
  const [editingSeason, setEditingSeason] = useState<PeakSeason | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch properties
  useEffect(() => {
    if (!session?.access_token) return;
    const fetchProps = async () => {
      try {
        const res = await fetch(`${apiUrl}/tenant/properties?all=true`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const json = await res.json();
        setProperties(json.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchProps();
  }, [session, apiUrl]);

  // Fetch rooms when property selected
  useEffect(() => {
    if (!session?.access_token || !selectedProperty) return;
    const fetchRooms = async () => {
      try {
        const res = await fetch(
          `${apiUrl}/tenant/rooms?property_id=${selectedProperty}&all=true`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
        const json = await res.json();
        setRooms(json.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchRooms();
  }, [session, selectedProperty, apiUrl]);

  const monthStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  const fetchPeakSeasons = useCallback(async () => {
    if (!session?.access_token || !selectedRoom) return;
    try {
      setLoadingData(true);
      const res = await fetch(
        `${apiUrl}/tenant/peak-seasons?room_id=${selectedRoom}&month=${monthStr(
          month
        )}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal mengambil data");
      setPeakSeasons(json.data);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoadingData(false);
    }
  }, [session, selectedRoom, month, apiUrl]);

  useEffect(() => {
    fetchPeakSeasons();
  }, [fetchPeakSeasons]);

  // Build modifier dates
  const peakDates: Date[] = (() => {
    const arr: Date[] = [];
    peakSeasons.forEach((p) => {
      const start = new Date(p.start_date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(p.end_date);
      end.setHours(0, 0, 0, 0);
      let d = new Date(start);
      while (d <= end) {
        arr.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
    });
    return arr;
  })();

  // Helpers
  const formatDate = (d: Date) =>
    d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const formatForApi = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  // Format input value for display when type is 'fixed'
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
      // percentage, keep as entered digits only
      const raw = val.replace(/[^\d]/g, "");
      setPendingForm((f) => (f ? { ...f, value: raw } : null));
    }
  };

  // ---- CRUD Handlers ----
  const openAddDialog = () => {
    setPendingForm({ type: "percentage", value: "" });
    setPendingRange(undefined);
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
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<PeakSeason | null>(null);
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
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Render ----
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
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium text-muted-foreground">
            Properti:
          </label>
        </div>
        <Select
          value={selectedProperty}
          onValueChange={(v) => {
            setSelectedProperty(v);
            setSelectedRoom("");
            setPeakSeasons([]);
          }}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Pilih Properti" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((p) => (
              <SelectItem key={p.id} value={p.id.toString()}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedProperty && (
          <>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium text-muted-foreground">
                Room:
              </label>
            </div>
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Pilih Room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={r.id.toString()}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      {/* Kalender & Tabel (berdampingan pada layar lg ke atas) */}
      <div className="flex flex-col lg:flex-row lg:gap-8">
        {/* Bagian Kalender */}
        <div className="lg:w-1/4">
          {loadingData ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin" />
            </div>
          ) : selectedRoom ? (
            <Calendar
              className="mx-auto"
              month={month}
              onMonthChange={setMonth}
              numberOfMonths={1}
              showOutsideDays
              modifiers={{ peak: peakDates }}
              modifiersClassNames={{ peak: "bg-sky-400 text-white" }}
              captionLayout="dropdown"
            />
          ) : (
            <div className="text-center text-muted-foreground py-8 text-sm">
              Pilih properti dan room terlebih dahulu
            </div>
          )}
        </div>

        {/* Bagian Tabel */}
        {selectedRoom && !loadingData && (
          <div className="lg:w-3/4 overflow-x-auto mt-6 lg:mt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Mulai</TableHead>
                  <TableHead>Selesai</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Harga Awal</TableHead>
                  <TableHead>Harga Akhir</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {peakSeasons.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center text-muted-foreground py-6"
                    >
                      Tidak ada peak season untuk bulan{" "}
                      {month.toLocaleDateString("id-ID", {
                        month: "long",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ) : (
                  peakSeasons.map((p, idx) => (
                    <TableRow key={p.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        {formatDate(new Date(p.start_date))}
                      </TableCell>
                      <TableCell>{formatDate(new Date(p.end_date))}</TableCell>
                      {/* Durasi */}
                      <TableCell>
                        {(() => {
                          const durasi =
                            (new Date(p.end_date).getTime() -
                              new Date(p.start_date).getTime()) /
                              (1000 * 60 * 60 * 24) +
                            1;
                          return `${durasi} hari`;
                        })()}
                      </TableCell>
                      <TableCell>{p.type}</TableCell>
                      <TableCell>
                        {p.type === "percentage"
                          ? `${p.value} %`
                          : formatCurrency(p.value)}
                      </TableCell>
                      {/* Harga Awal */}
                      {(() => {
                        const room = rooms.find((r) => r.id === p.room_id);
                        const base = room?.price ?? 0;
                        return (
                          <TableCell>
                            {base ? formatCurrency(base) : "-"}
                          </TableCell>
                        );
                      })()}
                      {/* Harga Akhir */}
                      {(() => {
                        const room = rooms.find((r) => r.id === p.room_id);
                        const base = room?.price ?? 0;
                        const final =
                          p.type === "percentage"
                            ? base + (base * p.value) / 100
                            : base + p.value;
                        return (
                          <TableCell>
                            {base ? formatCurrency(final) : "-"}
                          </TableCell>
                        );
                      })()}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(p)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget(p)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog
        open={showAddDialog || showEditDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setShowEditDialog(false);
          }
        }}
      >
        <DialogContent className="w-[340px] sm:w-[420px] md:w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {showEditDialog ? "Edit Peak Season" : "Tambah Peak Season"}
            </DialogTitle>
            <DialogDescription>
              Pilih rentang tanggal dan atur harga khusus
            </DialogDescription>
          </DialogHeader>
          {/* Form */}
          <div className="space-y-4">
            <Calendar
              mode="range"
              numberOfMonths={1}
              selected={pendingForm?.range}
              onSelect={(r) =>
                setPendingForm((f) => (f ? { ...f, range: r } : null))
              }
              captionLayout="dropdown"
              className="mx-auto"
            />
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <label className="text-sm font-medium">Tipe Harga</label>
                <Select
                  value={pendingForm?.type}
                  onValueChange={(v) =>
                    setPendingForm((f) =>
                      f ? { ...f, type: v as "percentage" | "fixed" } : null
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed (IDR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium">Value</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={
                    pendingForm
                      ? pendingForm.type === "fixed"
                        ? formatInputValue(pendingForm.value)
                        : pendingForm.value
                      : ""
                  }
                  onChange={(e) => handleValueChange(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>
          </div>
          {/* Summary */}
          {pendingForm?.range?.from &&
            pendingForm.value &&
            (() => {
              const roomName =
                rooms.find((r) => r.id.toString() === selectedRoom)?.name || "";
              const startStr = formatDate(pendingForm.range!.from);
              const endStr = formatDate(
                pendingForm.range!.to ?? pendingForm.range!.from
              );
              const sameDay =
                !pendingForm.range!.to ||
                pendingForm.range!.from.toDateString() ===
                  pendingForm.range!.to.toDateString();
              const descValue =
                pendingForm.type === "percentage"
                  ? `${pendingForm.value} %`
                  : Number(pendingForm.value).toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    });
              return (
                <p className="text-sm text-center my-2">
                  Kamar {roomName} akan dikenakan kenaikan harga sebesar{" "}
                  {descValue} {sameDay ? "pada tanggal" : "mulai"} {startStr}
                  {sameDay ? "" : ` sampai ${endStr}`}
                </p>
              );
            })()}
          <DialogFooter>
            <Button
              onClick={openConfirm}
              disabled={!pendingForm?.range?.from || !pendingForm.value}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog
        open={showConfirmDialog}
        onOpenChange={(o) => {
          if (!o) setShowConfirmDialog(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Peak Season</DialogTitle>
          </DialogHeader>
          <p className="text-center py-4">Apakah data sudah benar?</p>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmDialog(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button onClick={savePeakSeason} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Konfirmasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Peak Season</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Anda yakin ingin menghapus data ini?
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog
        open={!!errorMessage}
        onOpenChange={(o) => {
          if (!o) setErrorMessage(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terjadi Kesalahan</DialogTitle>
          </DialogHeader>
          <p className="text-center py-4">{errorMessage}</p>
          <DialogFooter>
            <Button onClick={() => setErrorMessage(null)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
