"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import SearchHeader from "@/components/SearchHeader";
import PropertyDetail from "@/components/PropertyDetail";
import RoomList from "@/components/RoomList";
import { SearchParams } from "@/lib/types/search";

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

const PropertyDetailPage = () => {
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
    const fetchPropertyDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const checkIn = currentSearchParams.check_in;
        const checkOut = currentSearchParams.check_out;
        const guests = currentSearchParams.guests;

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
        <SearchHeader searchParams={currentSearchParams} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Memuat detail property...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SearchHeader searchParams={currentSearchParams} />
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
        <SearchHeader searchParams={currentSearchParams} />
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Jenis Kamar</h2>
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

export default PropertyDetailPage;
