"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { Property, RoomWithPictures } from "@/lib/types/tenant";

export function useRoomGallery() {
  const { session } = useAuth();
  const searchParams = useSearchParams();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<RoomWithPictures[]>([]);
  const [selectedProperty, setSelectedProperty] = useState(
    searchParams.get("property") || ""
  );

  const [loading, setLoading] = useState({ properties: true, rooms: false });
  const [error, setError] = useState<string | null>(null);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);

  const fetcher = useCallback(
    async (url: string, options: RequestInit = {}) => {
      if (!session?.access_token)
        throw new Error("Authentication token not found.");
      const res = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          ...options.headers,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Request failed");
      }
      return res.json();
    },
    [session]
  );

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading((prev) => ({ ...prev, properties: true }));
      try {
        const data = await fetcher(`${apiUrl}/tenant/properties?all=true`);
        setProperties(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat properti.");
      } finally {
        setLoading((prev) => ({ ...prev, properties: false }));
      }
    };
    if (session) fetchProperties();
  }, [session, fetcher, apiUrl]);

  const fetchRooms = useCallback(async () => {
    if (!selectedProperty) return;
    setLoading((prev) => ({ ...prev, rooms: true }));
    setError(null);
    setEmptyMessage(null);
    try {
      const url = `${apiUrl}/pictures/all-room-pictures?property_id=${selectedProperty}`;
      const data = await fetcher(url);
      if (data.data.rooms && data.data.rooms.length > 0) {
        setRooms(data.data.rooms);
      } else {
        setRooms([]);
        setEmptyMessage(
          data.data.message || "Properti ini belum memiliki room."
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data room.");
      setRooms([]);
    } finally {
      setLoading((prev) => ({ ...prev, rooms: false }));
    }
  }, [selectedProperty, fetcher, apiUrl]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const deleteRoomPicture = async (pictureId: number): Promise<boolean> => {
    try {
      await fetcher(`${apiUrl}/pictures/room/${pictureId}`, {
        method: "DELETE",
      });
      fetchRooms(); // Re-fetch to update the list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus foto.");
      return false;
    }
  };

  return {
    properties,
    rooms,
    selectedProperty,
    setSelectedProperty,
    loading,
    error,
    setError,
    emptyMessage,
    deleteRoomPicture,
    fetchRooms,
  };
}
