"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

import PageHeader from "@/components/tenant/PageHeader";
import { RoomForm } from "@/components/tenant/rooms/RoomForm";
import { LoadingSkeleton } from "@/components/tenant/LoadingSkeleton";
// useRoomForm now handled inside RoomForm, no longer needed here

import type { Property, PropertyResponse } from "@/lib/types/tenant";

export default function AddRoomPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { session, loading: authLoading } = useAuth();
  // useRoomForm now handled inside RoomForm, no longer needed here

  useEffect(() => {
    if (session) {
      fetchProperties();
    }
  }, [session]);

  const fetchProperties = async () => {
    if (!session?.access_token) {
      setError("Token otentikasi tidak ditemukan.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenant/properties?all=true`,
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

      const data: PropertyResponse = await response.json();
      setProperties(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingSkeleton />;
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium mb-2">Sesi Tidak Ditemukan</h3>
          <p className="text-muted-foreground mb-4">
            Silakan login kembali untuk mengakses halaman ini.
          </p>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium mb-2">Terjadi Kesalahan</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchProperties}>Coba Lagi</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Room Baru"
        description="Buat room baru untuk properti Anda."
        backHref="/tenant/rooms"
      />
      <RoomForm
        properties={properties}
        // onFormSubmit={handleConfirmSubmit} // This prop is no longer needed here
        // isSubmitting={submitting} // This prop is no longer needed here
        // error={formError} // This prop is no longer needed here
      />
    </div>
  );
}
