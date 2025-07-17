import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface Property {
  id: number;
  name: string;
}

export interface Room {
  id: number;
  name: string;
  price?: number;
}

export interface PeakSeason {
  id: number;
  room_id: number;
  type: "percentage" | "fixed";
  value: number;
  start_date: string;
  end_date: string;
}

export const usePeakSeasonDataV2 = () => {
  const { session } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");

  const [month, setMonth] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const [peakSeasons, setPeakSeasons] = useState<PeakSeason[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch properties
  useEffect(() => {
    if (!session?.access_token) return;
    const fetchProps = async () => {
      try {
        const res = await fetch(`${apiUrl}/tenant/properties?all=true`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const json = await res.json();
        setProperties(json.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchProps();
  }, [session, apiUrl]);

  // Fetch rooms when property selected
  useEffect(() => {
    if (!session?.access_token || !selectedProperty) return;
    const fetchRooms = async () => {
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
        const json = await res.json();
        setRooms(json.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchRooms();
  }, [session, selectedProperty, apiUrl]);

  const monthStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  const fetchPeakSeasons = useCallback(async () => {
    if (!session?.access_token || !selectedRoom) return;
    try {
      setLoadingData(true);
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
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoadingData(false);
    }
  }, [session, selectedRoom, month, apiUrl]);

  useEffect(() => {
    fetchPeakSeasons();
  }, [fetchPeakSeasons]);

  // Build modifier dates for calendar
  const peakDates: Date[] = (() => {
    const arr: Date[] = [];
    peakSeasons.forEach((p) => {
      const start = new Date(p.start_date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(p.end_date);
      end.setHours(0, 0, 0, 0);
      let d = new Date(start);
      while (d <= end) {
        arr.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
    });
    return arr;
  })();

  const handlePropertyChange = (value: string) => {
    setSelectedProperty(value);
    setSelectedRoom("");
    setPeakSeasons([]);
  };

  return {
    properties,
    rooms,
    selectedProperty,
    selectedRoom,
    month,
    peakSeasons,
    loadingData,
    errorMessage,
    peakDates,
    setSelectedProperty: handlePropertyChange,
    setSelectedRoom,
    setMonth,
    fetchPeakSeasons,
    setErrorMessage,
  };
};
