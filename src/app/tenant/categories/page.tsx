"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Edit,
  Plus,
  Loader2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useCategoriesPage } from "@/hooks/useCategoriesPage";
import PageHeader from "@/components/tenant/PageHeader";

export default function CategoriesPage() {
  const {
    categories,
    loading,
    error,
    submitting,
    session,
    showAddDialog,
    setShowAddDialog,
    showEditDialog,
    setShowEditDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    categoryName,
    setCategoryName,
    editingCategory,
    deletingCategory,
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
    openAddDialog,
    openEditDialog,
    openDeleteDialog,
    setError,
  } = useCategoriesPage();

  const renderContent = () => {
    if (loading) {
      return <CategoriesSkeleton />;
    }

    if (error && !showAddDialog && !showEditDialog && !showDeleteDialog) {
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
              Silakan login untuk mengelola kategori.
            </p>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (categories.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-96 gap-4">
            <Building2 className="w-12 h-12 text-muted-foreground" />
            <h3 className="text-xl font-semibold">Belum Ada Kategori</h3>
            <p className="text-muted-foreground">
              Mulai dengan menambahkan kategori properti pertama Anda.
            </p>
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Kategori
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
                <TableHead>Nama Kategori</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
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
                          onClick={() => openEditDialog(category)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(category)}
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
        title="Kategori Properti"
        description="Kelola kategori untuk properti Anda."
      >
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kategori
        </Button>
      </PageHeader>

      {renderContent()}

      {/* Add/Edit Dialog */}
      <Dialog
        open={showAddDialog || showEditDialog}
        onOpenChange={showAddDialog ? setShowAddDialog : setShowEditDialog}
      >
        <DialogContent
          className="sm:max-w-[425px]"
          onCloseAutoFocus={() => setError(null)}
        >
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? `Mengubah nama kategori "${editingCategory.name}".`
                : "Buat kategori baru untuk properti Anda."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nama
              </Label>
              <Input
                id="name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="col-span-3"
                placeholder="Contoh: Villa"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 col-span-4">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                showAddDialog
                  ? setShowAddDialog(false)
                  : setShowEditDialog(false)
              }
            >
              Batal
            </Button>
            <Button
              type="submit"
              onClick={editingCategory ? handleEditCategory : handleAddCategory}
              disabled={submitting || !categoryName.trim()}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {editingCategory ? "Simpan Perubahan" : "Tambah Kategori"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent
          className="sm:max-w-[425px]"
          onCloseAutoFocus={() => setError(null)}
        >
          <DialogHeader>
            <DialogTitle>Hapus Kategori?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat diurungkan. Apakah Anda yakin ingin
              menghapus kategori{" "}
              <strong>&quot;{deletingCategory?.name}&quot;</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className="h-4 w-40" />
              </TableHead>
              <TableHead className="text-right">
                <Skeleton className="h-4 w-10 ml-auto" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
