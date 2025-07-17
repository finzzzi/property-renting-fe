import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DateRange } from "react-day-picker";

// Keep interfaces in a central place, maybe types/tenant.ts in the future
interface Property {
  id: number;
  name: string;
}
interface Room {
  id: number;
  name: string;
}
interface PeakSeason {
  id: number;
  room_id: number;
  type: "percentage" | "fixed";
  value: number;
  start_date: string;
  end_date: string;
}

export const usePeakSeasonData = () => {
  const { session } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [peakSeasons, setPeakSeasons] = useState<PeakSeason[]>([]);

  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [month, setMonth] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const [loading, setLoading] = useState({
    properties: false,
    rooms: false,
    peakSeasons: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch properties
  useEffect(() => {
    if (!session?.access_token) return;
    const fetchProps = async () => {
      setLoading((prev) => ({ ...prev, properties: true }));
      try {
        const res = await fetch(`${apiUrl}/tenant/properties?all=true`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (!res.ok) throw new Error("Gagal memuat properti.");
        const json = await res.json();
        setProperties(json.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Terjadi kesalahan");
      } finally {
        setLoading((prev) => ({ ...prev, properties: false }));
      }
    };
    fetchProps();
  }, [session, apiUrl]);

  // Fetch rooms when property is selected
  useEffect(() => {
    if (!session?.access_token || !selectedProperty) {
      setRooms([]);
      setSelectedRoom("");
      setPeakSeasons([]);
      return;
    }
    const fetchRooms = async () => {
      setLoading((prev) => ({ ...prev, rooms: true }));
      try {
        const res = await fetch(
          `${apiUrl}/tenant/rooms?property_id=${selectedProperty}&all=true`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Gagal memuat ruangan.");
        const json = await res.json();
        setRooms(json.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Terjadi kesalahan");
      } finally {
        setLoading((prev) => ({ ...prev, rooms: false }));
      }
    };
    fetchRooms();
  }, [session, selectedProperty, apiUrl]);

  const monthStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  const fetchPeakSeasons = useCallback(async () => {
    if (!session?.access_token || !selectedRoom) {
      setPeakSeasons([]);
      return;
    }
    setLoading((prev) => ({ ...prev, peakSeasons: true }));
    setError(null);
    try {
      const res = await fetch(
        `${apiUrl}/tenant/peak-seasons?room_id=${selectedRoom}&month=${monthStr(
          month
        )}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal mengambil data");
      setPeakSeasons(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading((prev) => ({ ...prev, peakSeasons: false }));
    }
  }, [session, selectedRoom, month, apiUrl]);

  useEffect(() => {
    fetchPeakSeasons();
  }, [fetchPeakSeasons]);

  const peakDates = peakSeasons.flatMap((p) => {
    const dates = [];
    const start = new Date(p.start_date);
    const end = new Date(p.end_date);
    let current = new Date(start.toISOString().slice(0, 10));

    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  });

  return {
    properties,
    rooms,
    peakSeasons,
    selectedProperty,
    setSelectedProperty,
    selectedRoom,
    setSelectedRoom,
    month,
    setMonth,
    loading,
    error,
    peakDates,
    fetchPeakSeasons, // expose for manual refresh
  };
};
