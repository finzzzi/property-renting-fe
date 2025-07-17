import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Category, CategoryResponse } from "@/lib/types/tenant-property-types";

export const useCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { session, loading: authLoading } = useAuth();

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form state
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );

  const fetchCategories = async () => {
    if (!session?.access_token) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenant/categories?tenant_id=${session.user.id}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Gagal mengambil data kategori");
      const data: CategoryResponse = await response.json();
      setCategories(
        data.data.filter((cat) => cat.tenant_id === session.user.id)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan yang tidak diketahui"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchCategories();
    }
  }, [session]);

  const resetForm = () => {
    setCategoryName("");
    setEditingCategory(null);
    setDeletingCategory(null);
    setError(null);
  };

  const handleAddCategory = async () => {
    if (!session?.access_token || !categoryName.trim()) return;
    setSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenant/categories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            name: categoryName.trim(),
            tenant_id: session.user.id,
          }),
        }
      );
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Gagal menambahkan kategori");
      }
      await fetchCategories();
      setShowAddDialog(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menambahkan kategori"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCategory = async () => {
    if (!session?.access_token || !editingCategory || !categoryName.trim())
      return;
    setSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenant/categories/${editingCategory.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ name: categoryName.trim() }),
        }
      );
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Gagal mengupdate kategori");
      }
      await fetchCategories();
      setShowEditDialog(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengupdate kategori"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!session?.access_token || !deletingCategory) return;
    setSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenant/categories/${deletingCategory.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Gagal menghapus kategori");
      }
      await fetchCategories();
      setShowDeleteDialog(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus kategori");
    } finally {
      setSubmitting(false);
    }
  };

  // Dialog handlers
  const openAddDialog = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const openEditDialog = (category: Category) => {
    resetForm();
    setEditingCategory(category);
    setCategoryName(category.name);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (category: Category) => {
    setDeletingCategory(category);
    setShowDeleteDialog(true);
  };

  return {
    categories,
    loading: loading || authLoading,
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
  };
};
