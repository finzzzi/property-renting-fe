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
  Bed,
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
import Pagination from "@/components/Pagination";
import { usePropertiesPage } from "@/hooks/usePropertiesPage";
import PageHeader from "@/components/tenant/PageHeader";

export default function PropertiesPage() {
  const {
    properties,
    loading,
    error,
    session,
    pagination,
    showDeleteDialog,
    deletingProperty,
    submitting,
    handlePageChange,
    handleEditProperty,
    openDeleteDialog,
    closeDeleteDialog,
    handleDeleteProperty,
  } = usePropertiesPage();

  const renderContent = () => {
    if (loading) {
      return <PropertiesSkeleton />;
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
              Silakan login untuk melihat daftar properti Anda.
            </p>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (properties.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-96 gap-4">
            <Home className="w-12 h-12 text-muted-foreground" />
            <h3 className="text-xl font-semibold">Belum Ada Properti</h3>
            <p className="text-muted-foreground">
              Mulai dengan menambahkan properti baru Anda.
            </p>
            <Button asChild>
              <Link href="/tenant/properties/add">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Properti
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
                <TableHead>Nama Properti</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead className="text-center">Jumlah Room</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((prop) => (
                <TableRow key={prop.id}>
                  <TableCell className="font-medium">{prop.name}</TableCell>
                  <TableCell>{prop.category?.name || "-"}</TableCell>
                  <TableCell>
                    {prop.city ? `${prop.city.type} ${prop.city.name}` : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {(prop as any).total_rooms || 0}
                  </TableCell>
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
                          onClick={() => handleEditProperty(prop.id)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/tenant/rooms/add">
                            <Bed className="mr-2 h-4 w-4" />
                            <span>Tambah Room</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(prop)}
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
        title="Daftar Properti"
        description="Kelola semua properti yang Anda miliki di satu tempat."
      >
        <Button asChild>
          <Link href="/tenant/properties/add">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Properti
          </Link>
        </Button>
      </PageHeader>

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
            <DialogTitle>Hapus Properti?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat diurungkan. Ini akan menghapus properti{" "}
              <strong>{deletingProperty?.name}</strong> dan semua room yang
              terkait.
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
              onClick={handleDeleteProperty}
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

function PropertiesSkeleton() {
  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className="h-4 w-40" />
              </TableHead>
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
                <Skeleton className="h-4 w-10" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
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
