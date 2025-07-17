"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import SearchHeader from "@/components/SearchHeader";
import PropertyDetail from "@/components/PropertyDetail";
import RoomList from "@/components/RoomList";
import { SearchParams } from "@/lib/types/search";
import { Skeleton } from "@/components/ui/skeleton";

interface PropertyData {
  property_id: number;
  name: string;
  description: string;
  location: string;
  category: string;
  city: { name: string; type: string };
  property_pictures: Array<{ id: number; file_path: string; is_main: boolean }>;
  available_rooms: Array<any>;
}

const PropertyDetailContent = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const roomListRef = useRef<HTMLDivElement>(null);

  const propertyId = params.id as string;

  // Get search parameters from URL
  const currentSearchParams: SearchParams = {
    city_id: searchParams.get("city_id") || "",
    check_in: searchParams.get("check_in") || "",
    check_out: searchParams.get("check_out") || "",
    guests: searchParams.get("guests") || "1",
    page: searchParams.get("page") || "1",
    property_name: searchParams.get("property_name") || "",
    category_name: searchParams.get("category_name") || "",
    sort_by: searchParams.get("sort_by") || "",
    sort_order: searchParams.get("sort_order") || "",
  };

  useEffect(() => {
    // Helper untuk menggeser tanggal ke belakang/ke depan sejumlah hari tertentu
    const shiftDate = (dateStr: string, days: number) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      // Geser tanggal berdasarkan zona waktu lokal
      date.setDate(date.getDate() + days);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    const fetchPropertyDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Ambil original tanggal dari query string
        const checkInOriginal = currentSearchParams.check_in;
        const checkOutOriginal = currentSearchParams.check_out;
        const guests = currentSearchParams.guests;

        // Gunakan tanggal asli tanpa penyesuaian karena issue DB sudah diperbaiki
        const checkIn = checkInOriginal;
        const checkOut = checkOutOriginal;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/properties/detail?property_id=${propertyId}&check_in=${checkIn}&check_out=${checkOut}&guests=${guests}`
        );

        if (!response.ok) {
          throw new Error("Gagal mengambil data property");
        }

        const result = await response.json();
        setPropertyData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchPropertyDetail();
    }
  }, [
    propertyId,
    currentSearchParams.check_in,
    currentSearchParams.check_out,
    currentSearchParams.guests,
  ]);

  // Auto scroll to room list after data is loaded
  useEffect(() => {
    if (propertyData && roomListRef.current) {
      setTimeout(() => {
        roomListRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 500); // Small delay to ensure page is fully rendered
    }
  }, [propertyData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
          {/* Property image skeleton */}
          <Skeleton className="h-64 w-full rounded-lg" />

          {/* Title skeleton */}
          <Skeleton className="h-8 w-2/3" />

          {/* Description skeleton */}
          <Skeleton className="h-4 w-1/2" />

          {/* Rooms list skeleton */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!propertyData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Property tidak ditemukan</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with search form */}
      {/* <SearchHeader searchParams={currentSearchParams} /> */}

      {/* Main Content */}
      <div className="container mx-auto max-w-5xl px-4 py-5">
        {/* Property Detail */}
        <PropertyDetail property={propertyData} />

        {/* Available Rooms */}
        <div className="mt-8" ref={roomListRef}>
          <RoomList
            rooms={propertyData.available_rooms}
            searchParams={currentSearchParams}
            propertyId={propertyId}
          />
        </div>
      </div>
    </div>
  );
};

export default function PropertyDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      }
    >
      <PropertyDetailContent />
    </Suspense>
  );
}
