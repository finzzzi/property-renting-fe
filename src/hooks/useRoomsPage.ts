import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Room } from "@/lib/types/tenant-room-types";
import { Property } from "@/lib/types/tenant-property-types";

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}

interface RoomApiResponse {
  success: boolean;
  message: string;
  data: any[]; // Raw room data from API
  pagination: PaginationInfo;
}

interface PropertyApiResponse {
  success: boolean;
  message: string;
  data: Property[];
}

export const useRoomsPage = () => {
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

  const fetchProperties = async () => {
    if (!session?.access_token) {
      setLoadingProperties(false);
      return;
    }

    try {
      setLoadingProperties(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenant/properties?all=true`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      if (!response.ok)
        throw new Error(`Gagal mengambil data properti: ${response.status}`);
      const data: PropertyApiResponse = await response.json();
      setProperties(data.data);
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setLoadingProperties(false);
    }
  };

  const fetchRooms = async (page: number = 1) => {
    if (!session?.access_token) {
      setError("Token otentikasi tidak ditemukan");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      let url = `${process.env.NEXT_PUBLIC_API_URL}/tenant/rooms?page=${page}`;
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
        throw new Error(`Gagal mengambil data room: ${response.status}`);
      }
      const data: RoomApiResponse = await response.json();
      const transformedRooms: Room[] = (data.data || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description || "",
        price: r.price,
        max_guests: r.max_guests,
        quantity: r.quantity,
        property_id: r.property_id,
        property_name: r.properties?.name || "-",
        created_at: r.created_at,
        updated_at: r.updated_at,
      }));
      setRooms(transformedRooms);

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
      fetchProperties();
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchRooms(currentPage);
    }
  }, [session, currentPage, selectedProperty]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePropertyFilterChange = (value: string) => {
    setCurrentPage(1);
    setSelectedProperty(value);
  };

  const handleEditRoom = (roomId: number) => {
    router.push(`/tenant/rooms/edit/${roomId}`);
  };

  const openDeleteDialog = (room: Room) => {
    setDeletingRoom(room);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setDeletingRoom(null);
    setShowDeleteDialog(false);
  };

  const handleDeleteRoom = async () => {
    if (!deletingRoom || !session?.access_token) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenant/rooms/${deletingRoom.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menghapus room");
      }
      // Refresh rooms list
      fetchRooms(currentPage);
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return {
    rooms,
    properties,
    loading: loading || authLoading || loadingProperties,
    error,
    session,
    pagination,
    currentPage,
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
  };
};
