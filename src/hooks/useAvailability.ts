"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Property, Room, Unavailability } from "@/lib/types/tenant";

export function useAvailability() {
  const { session } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>(
    []
  );

  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [month, setMonth] = useState<Date>(() => new Date());

  const [loading, setLoading] = useState({
    properties: false,
    rooms: false,
    unavailabilities: false,
  });
  const [error, setError] = useState<string | null>(null);

  const fetcher = useCallback(
    async (url: string) => {
      if (!session?.access_token)
        throw new Error("Authentication token not found.");
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || `Request failed with status ${res.status}`
        );
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
        setError(
          err instanceof Error ? err.message : "Failed to fetch properties."
        );
      } finally {
        setLoading((prev) => ({ ...prev, properties: false }));
      }
    };
    if (session) fetchProperties();
  }, [session, fetcher, apiUrl]);

  useEffect(() => {
    if (!selectedProperty) {
      setRooms([]);
      setUnavailabilities([]);
      setSelectedRoom("");
      return;
    }
    const fetchRooms = async () => {
      setLoading((prev) => ({ ...prev, rooms: true }));
      try {
        const data = await fetcher(
          `${apiUrl}/tenant/rooms?property_id=${selectedProperty}&all=true`
        );
        setRooms(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch rooms.");
      } finally {
        setLoading((prev) => ({ ...prev, rooms: false }));
      }
    };
    fetchRooms();
  }, [selectedProperty, fetcher, apiUrl]);

  const getMonthString = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const fetchUnavailabilities = useCallback(async () => {
    if (!selectedRoom) return;
    setLoading((prev) => ({ ...prev, unavailabilities: true }));
    setError(null);
    try {
      const monthStr = getMonthString(month);
      const data = await fetcher(
        `${apiUrl}/tenant/unavailabilities/list?room_id=${selectedRoom}&month=${monthStr}`
      );
      setUnavailabilities(data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch unavailabilities."
      );
    } finally {
      setLoading((prev) => ({ ...prev, unavailabilities: false }));
    }
  }, [selectedRoom, month, fetcher, apiUrl]);

  useEffect(() => {
    fetchUnavailabilities();
  }, [fetchUnavailabilities]);

  return {
    properties,
    rooms,
    unavailabilities,
    selectedProperty,
    setSelectedProperty,
    selectedRoom,
    setSelectedRoom,
    month,
    setMonth,
    loading,
    error,
    setError,
    fetchUnavailabilities,
    fetcher,
  };
}
