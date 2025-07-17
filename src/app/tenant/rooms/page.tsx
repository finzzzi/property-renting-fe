"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  Home,
  Filter,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
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
import { useRoomsPage } from "@/hooks/useRoomsPage";
import PageHeader from "@/components/tenant/PageHeader";

export default function RoomsPage() {
  const {
    rooms,
    properties,
    loading,
    error,
    session,
    pagination,
    selectedProperty,
    showDeleteDialog,
    deletingRoom,
    submitting,
    handlePageChange,
    handlePropertyFilterChange,
    handleEditRoom,
    openDeleteDialog,
    closeDeleteDialog,
    handleDeleteRoom,
    formatPrice,
  } = useRoomsPage();

  const renderContent = () => {
    if (loading) {
      return <RoomsSkeleton />;
    }

    if (error) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-96 gap-4">
            <Building2 className="w-12 h-12 text-muted-foreground" />
            <h3 className="text-xl font-semibold">Terjadi Kesalahan</h3>
            <p className="text-muted-foreground text-center">{error}</p>
          </CardContent>
        </Card>
      );
    }

    if (!session) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-96 gap-4">
            <Building2 className="w-12 h-12 text-muted-foreground" />
            <h3 className="text-xl font-semibold">Akses Ditolak</h3>
            <p className="text-muted-foreground">
              Silakan login untuk melihat daftar room Anda.
            </p>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (rooms.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-96 gap-4">
            <Home className="w-12 h-12 text-muted-foreground" />
            <h3 className="text-xl font-semibold">Belum Ada Room</h3>
            <p className="text-muted-foreground">
              Mulai dengan menambahkan room baru untuk properti Anda.
            </p>
            <Button asChild>
              <Link href="/tenant/rooms/add">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Room
              </Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Room</TableHead>
                <TableHead>Properti</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="text-center">Tamu</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.name}</TableCell>
                  <TableCell>{room.property_name}</TableCell>
                  <TableCell className="text-right">
                    {formatPrice(room.price)}
                  </TableCell>
                  <TableCell className="text-center">
                    {room.max_guests}
                  </TableCell>
                  <TableCell className="text-center">{room.quantity}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Buka menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditRoom(room.id)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(room)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Hapus</span>
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
        title="Daftar Room"
        description="Kelola semua room di properti Anda."
      >
        <Button asChild>
          <Link href="/tenant/rooms/add">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Room
          </Link>
        </Button>
      </PageHeader>

      <div className="flex justify-start items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select
          onValueChange={handlePropertyFilterChange}
          value={selectedProperty}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter berdasarkan properti" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Properti</SelectItem>
            {properties.map((prop) => (
              <SelectItem key={prop.id} value={prop.id.toString()}>
                {prop.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {renderContent()}

      {pagination && pagination.total_pages > 1 && (
        <Pagination
          pagination={{
            ...pagination,
            total_properties: pagination.total_items,
          }}
          onPageChange={handlePageChange}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={closeDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Room?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat diurungkan. Apakah Anda yakin ingin
              menghapus room <strong>{deletingRoom?.name}</strong>?
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menghapus...
                </>
              ) : (
                "Ya, Hapus"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RoomsSkeleton() {
  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className="h-4 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-32" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-20" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-12" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-10" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-10" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
