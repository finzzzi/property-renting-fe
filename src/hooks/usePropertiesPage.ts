import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Property } from "@/lib/types/tenant-property-types";
import { PaginationInfo } from "@/hooks/useRoomsPage";

interface PropertyApiResponse {
  success: boolean;
  message: string;
  data: any[];
  pagination: PaginationInfo;
}

export const usePropertiesPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session, loading: authLoading } = useAuth();
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const fetchProperties = async (page: number = 1) => {
    if (!session?.access_token) {
      setError("Token otentikasi tidak ditemukan");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenant/properties?page=${page}`,
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
      const data: PropertyApiResponse = await response.json();
      const transformedProperties: Property[] = (data.data || []).map(
        (p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          location: p.location,
          created_at: p.created_at,
          updated_at: p.updated_at,
          total_rooms: Array.isArray(p.rooms) ? p.rooms.length : 0,
          category_id: p.category_id,
          city_id: p.city_id,
          category: {
            id: p.category_id,
            name: p.property_categories?.name || "-",
          },
          city: {
            id: p.city_id,
            name: p.cities?.name || "-",
            type: p.cities?.type || "",
          },
        })
      );
      setProperties(transformedProperties);

      // Map pagination properties to match expected interface
      const mappedPagination = data.pagination
        ? {
            ...data.pagination,
            has_previous_page:
              (data.pagination as any).has_prev_page ||
              data.pagination.has_previous_page,
          }
        : null;

      setPagination(mappedPagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchProperties(currentPage);
    }
  }, [session, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEditProperty = (propertyId: number) => {
    router.push(`/tenant/properties/edit/${propertyId}`);
  };

  const openDeleteDialog = (property: Property) => {
    setDeletingProperty(property);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setDeletingProperty(null);
    setShowDeleteDialog(false);
  };

  const handleDeleteProperty = async () => {
    if (!deletingProperty || !session?.access_token) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenant/properties/${deletingProperty.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menghapus properti");
      }
      fetchProperties(currentPage);
      closeDeleteDialog();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan yang tidak diketahui"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return {
    properties,
    loading: loading || authLoading,
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
  };
};
