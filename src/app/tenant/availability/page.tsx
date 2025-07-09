"use client";

import { useEffect, useState, useCallback } from "react";
import { Building2, Filter, Plus, Trash2, Loader2 } from "lucide-react";
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
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

interface Property {
  id: number;
  name: string;
}

interface Room {
  id: number;
  name: string;
}

interface Unavailability {
  id: number;
  room_id: number;
  start_date: string; // ISO date
  end_date: string; // ISO date
}

export default function AvailabilityPage() {
  const { session, loading: authLoading } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");

  const [month, setMonth] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>(
    []
  );
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dialog states for Add & Delete
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Unavailability | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingRange, setPendingRange] = useState<DateRange | undefined>();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Fetch properties on mount
  useEffect(() => {
    if (!session?.access_token) return;

    const fetchProperties = async () => {
      try {
        const res = await fetch(`${apiUrl}/properties/my-properties?all=true`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (!res.ok) throw new Error("Gagal mengambil daftar properti");
        const json = await res.json();
        setProperties(json.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProperties();
  }, [session, apiUrl]);

  // Fetch rooms when property selected
  useEffect(() => {
    if (!session?.access_token || !selectedProperty) return;

    const fetchRooms = async () => {
      try {
        const res = await fetch(
          `${apiUrl}/properties/rooms/my-rooms?property_id=${selectedProperty}&all=true`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Gagal mengambil daftar room");
        const json = await res.json();
        setRooms(json.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRooms();
  }, [session, selectedProperty, apiUrl]);

  const getMonthString = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  };

  const fetchUnavailabilities = useCallback(async () => {
    if (!session?.access_token || !selectedRoom) return;

    try {
      setLoadingData(true);
      setError(null);
      const monthStr = getMonthString(month);
      const res = await fetch(
        `${apiUrl}/properties/rooms/unavailabilities?room_id=${selectedRoom}&month=${monthStr}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Gagal mengambil data unavailability");
      const json = await res.json();
      setUnavailabilities(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoadingData(false);
    }
  }, [session, selectedRoom, month, apiUrl]);

  // Fetch when month or room changes
  useEffect(() => {
    fetchUnavailabilities();
  }, [fetchUnavailabilities]);

  // Calculate unavailable dates for calendar modifiers
  const unavailableDates: Date[] = (() => {
    const dates: Date[] = [];
    const stripTime = (d: Date) => {
      const _d = new Date(d);
      _d.setHours(0, 0, 0, 0);
      return _d;
    };
    unavailabilities.forEach((u) => {
      const start = stripTime(new Date(u.start_date));
      const end = stripTime(new Date(u.end_date));
      let d = new Date(start);
      while (d <= end) {
        dates.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
    });
    return dates;
  })();

  const submitUnavailability = async (submittedRange: DateRange) => {
    if (!session?.access_token || !submittedRange.from || !selectedRoom) return;

    const formatForApi = (d: Date) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    try {
      setSubmitting(true);
      const body = {
        room_id: selectedRoom,
        start_date: formatForApi(submittedRange.from),
        end_date: formatForApi(submittedRange.to ?? submittedRange.from),
      };
      const res = await fetch(`${apiUrl}/properties/rooms/unavailabilities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menambah data");
      setShowConfirmDialog(false);
      setPendingRange(undefined);
      await fetchUnavailabilities();
    } catch (err) {
      setShowConfirmDialog(false);
      setShowAddDialog(false);
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const openConfirm = () => {
    if (!range?.from) return;
    setPendingRange(range);
    setShowAddDialog(false);
    setShowConfirmDialog(true);
  };

  const handleDelete = async () => {
    if (!session?.access_token || !deleteTarget) return;
    try {
      setSubmitting(true);
      const res = await fetch(
        `${apiUrl}/properties/rooms/unavailabilities/${deleteTarget.id}`,
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
      await fetchUnavailabilities();
    } catch (err) {
      setDeleteTarget(null);
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan");
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium mb-2">Session Tidak Ditemukan</h3>
          <p className="text-muted-foreground mb-4">
            Silakan login kembali untuk mengakses halaman ini
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ketersediaan Room</h1>
          <p className="text-muted-foreground">
            Tambahkan pengaturan unavailability untuk menjadikan kamar tidak
            bisa dipesan pada tanggal-tanggal tertentu
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} disabled={!selectedRoom}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Unavailability
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Property filter */}
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
            setUnavailabilities([]);
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

        {/* Room filter */}
        {selectedProperty && (
          <>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium text-muted-foreground">
                Room:
              </label>
            </div>
            <Select
              value={selectedRoom}
              onValueChange={(v) => setSelectedRoom(v)}
            >
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

      {/* Calendar */}
      {loadingData ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin" />
        </div>
      ) : selectedRoom ? (
        <Calendar
          className="mx-auto w-full max-w-md"
          month={month}
          onMonthChange={(m) => setMonth(m)}
          numberOfMonths={1}
          showOutsideDays
          modifiers={{ unavailable: unavailableDates }}
          modifiersClassNames={{ unavailable: "bg-red-400 text-white" }}
          captionLayout="dropdown"
        />
      ) : (
        <div className="text-center text-muted-foreground py-8">
          Silakan pilih properti dan room terlebih dahulu
        </div>
      )}

      {/* List Unavailabilities */}
      {selectedRoom && !loadingData && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Tidak Tersedia Mulai</TableHead>
              <TableHead>Sampai</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unavailabilities.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-6"
                >
                  Tidak ada pengaturan unavailability untuk bulan{" "}
                  {month.toLocaleDateString("id-ID", {
                    month: "long",
                    year: "numeric",
                  })}
                </TableCell>
              </TableRow>
            ) : (
              unavailabilities.map((u, idx) => (
                <TableRow key={u.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>
                    {new Date(u.start_date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    {new Date(u.end_date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(u)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="w-[340px] sm:w-[420px] md:w-[480px]">
          <DialogHeader>
            <DialogTitle>Tambah Unavailability</DialogTitle>
            <DialogDescription>
              Pilih rentang tanggal yang ingin ditandai sebagai "tidak tersedia"
            </DialogDescription>
          </DialogHeader>
          <Calendar
            mode="range"
            numberOfMonths={1}
            selected={range}
            onSelect={setRange}
            captionLayout="dropdown"
            className="mx-auto w-3/4"
          />
          {/* Summary */}
          {range?.from &&
            (() => {
              const name =
                rooms.find((r) => r.id.toString() === selectedRoom)?.name || "";
              const startStr = range.from.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });
              const endStr = (range.to ?? range.from).toLocaleDateString(
                "id-ID",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              );
              const sameDay =
                range.to == null ||
                range.from.toDateString() === range.to.toDateString();
              return (
                <p className="text-sm text-center my-2">
                  Kamar {name} akan tidak tersedia{" "}
                  {sameDay ? "pada tanggal" : "mulai tanggal"} {startStr}
                  {!sameDay && <> sampai {endStr}</>}
                </p>
              );
            })()}

          <Button onClick={openConfirm} disabled={submitting || !range?.from}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan
          </Button>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog
        open={showConfirmDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowConfirmDialog(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Unavailability</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menandai kamar{" "}
              {rooms.find((r) => r.id.toString() === selectedRoom)?.name || ""}{" "}
              tidak tersedia pada tanggal berikut?
            </DialogDescription>
          </DialogHeader>
          {pendingRange?.from &&
            (() => {
              const startStr = pendingRange.from.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });
              const endStr = (
                pendingRange.to ?? pendingRange.from
              ).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });
              const sameDay =
                pendingRange.to == null ||
                pendingRange.from.toDateString() ===
                  pendingRange.to.toDateString();
              return (
                <p className="text-center text-gray-900">
                  {sameDay ? startStr : `${startStr} - ${endStr}`}
                </p>
              );
            })()}
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmDialog(false)}
            >
              Batal
            </Button>
            <Button
              onClick={() => pendingRange && submitUnavailability(pendingRange)}
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Konfirmasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Unavailability</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus tanggal tidak tersedia ini?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog
        open={!!errorMessage}
        onOpenChange={(open) => {
          if (!open) setErrorMessage(null);
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
