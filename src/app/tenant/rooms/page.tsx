"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  Plus,
  MoreHorizontal,
  Edit,
  Home,
  Filter,
  Trash2,
  Loader2,
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
import Pagination from "@/components/Pagination";

interface Room {
  id: number;
  name: string;
  price: number;
  max_guests: number;
  quantity: number;
  property_id: number;
  property_name: string;
  created_at: string;
  updated_at: string;
}

interface Property {
  id: number;
  name: string;
  address: string;
}

interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}

interface RoomResponse {
  success: boolean;
  message: string;
  data: Room[];
  pagination: PaginationInfo;
}

interface PropertyResponse {
  success: boolean;
  message: string;
  data: Property[];
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session, loading: authLoading } = useAuth();
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (session) {
      fetchProperties();
      fetchRooms(currentPage);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      setCurrentPage(1); // Reset to first page when filter changes
      fetchRooms(1);
    }
  }, [selectedProperty]);

  useEffect(() => {
    if (session) {
      fetchRooms(currentPage);
    }
  }, [currentPage]);

  const fetchProperties = async () => {
    if (!session?.access_token) {
      setLoadingProperties(false);
      return;
    }

    try {
      setLoadingProperties(true);

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
        throw new Error(`Gagal mengambil data properti: ${response.status}`);
      }

      const data: PropertyResponse = await response.json();
      setProperties(data.data);
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setLoadingProperties(false);
    }
  };

  const fetchRooms = async (page: number = 1) => {
    if (!session?.access_token) {
      setError("Token authentikasi tidak ditemukan");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Build URL with optional property_id filter
      let url = `${process.env.NEXT_PUBLIC_API_URL}/properties/rooms/my-rooms?page=${page}`;
      if (selectedProperty !== "all") {
        url += `&property_id=${selectedProperty}`;
      }

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
        throw new Error(`Gagal mengambil data room: ${response.status}`);
      }

      const data: RoomResponse = await response.json();
      setRooms(data.data);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEditRoom = (roomId: number) => {
    router.push(`/tenant/rooms/edit/${roomId}`);
  };

  const handlePropertyFilterChange = (value: string) => {
    setSelectedProperty(value);
  };

  const handleDeleteRoom = async () => {
    if (!session?.access_token || !deletingRoom) return;

    try {
      setSubmitting(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/properties/rooms/delete/${deletingRoom.id}`,
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
        throw new Error(errorData.message || "Gagal menghapus room");
      }

      // Refresh rooms list
      await fetchRooms(currentPage);
      setShowDeleteDialog(false);
      setDeletingRoom(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteDialog = (room: Room) => {
    setDeletingRoom(room);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeletingRoom(null);
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">No</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Nama Properti</TableHead>
              <TableHead>Tamu Maksimal</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Room Quantity</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium mb-2">Terjadi Kesalahan</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchRooms(currentPage)}>Coba Lagi</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Room Saya</h1>
          <p className="text-muted-foreground">
            Kelola semua room yang Anda miliki
          </p>
        </div>
        <Button asChild>
          <Link href="/tenant/rooms/add">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Room
          </Link>
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium text-muted-foreground">
            Filter berdasarkan properti:
          </label>
        </div>
        <Select
          value={selectedProperty}
          onValueChange={handlePropertyFilterChange}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Semua properti" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Properti</SelectItem>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id.toString()}>
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
      </div>

      {/* Rooms List */}
      {rooms.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium mb-2">Belum Ada Room</h3>
            <p className="text-muted-foreground mb-4">
              Tambahkan room pertama Anda untuk memulai
            </p>
            <Button asChild>
              <Link href="/tenant/rooms/add">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Room
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Nama Properti</TableHead>
                <TableHead>Tamu Maksimal</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Room Quantity</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room, index) => (
                <TableRow key={room.id}>
                  <TableCell>
                    {pagination
                      ? pagination.items_per_page *
                          (pagination.current_page - 1) +
                        index +
                        1
                      : index + 1}
                  </TableCell>
                  <TableCell>{room.name}</TableCell>
                  <TableCell>{room.property_name}</TableCell>
                  <TableCell>{room.max_guests} orang</TableCell>
                  <TableCell>{formatPrice(room.price)}</TableCell>
                  <TableCell>{room.quantity}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditRoom(room.id)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Room
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(room)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus Room
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pagination && (
            <Pagination
              pagination={{
                current_page: pagination.current_page,
                total_pages: pagination.total_pages,
                has_next_page: pagination.has_next_page,
                has_prev_page: pagination.has_previous_page,
                total_properties: pagination.total_items,
              }}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Room</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus room "{deletingRoom?.name}"?
              Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data
              terkait room ini.
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
              onClick={handleDeleteRoom}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus Room"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
