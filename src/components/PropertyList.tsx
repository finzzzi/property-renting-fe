"use client";

import React from "react";
import PropertyCard from "@/components/PropertyCard";
import SortSelector from "@/components/SortSelector";
import Pagination from "@/components/Pagination";
import { Property, SearchParams, SearchResponse } from "@/lib/types/search";
import { Skeleton } from "@/components/ui/skeleton";

interface PropertyListProps {
  properties: Property[];
  searchParams: SearchParams;
  pagination: SearchResponse["pagination"] | null;
  loading: boolean;
  error: string | null;
  sortOption: string;
  onSortChange: (value: string) => void;
  onPageChange: (page: number) => void;
}

const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  searchParams,
  pagination,
  loading,
  error,
  sortOption,
  onSortChange,
  onPageChange,
}) => {
  return (
    <div className="lg:w-3/4">
      {/* Sort and Results Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          {pagination && pagination.total_properties > 0 && (
            <p className="text-gray-600">
              Ditemukan {pagination.total_properties} penginapan
            </p>
          )}
        </div>

        {/* Sort Dropdown */}
        <SortSelector sortOption={sortOption} onSortChange={onSortChange} />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && properties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">
            Tidak ada penginapan yang ditemukan untuk kriteria pencarian Anda.
          </p>
        </div>
      )}

      {/* Property List */}
      {!loading && !error && properties.length > 0 && (
        <>
          <div className="space-y-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.property_id}
                property={property}
                searchParams={searchParams}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && (
            <Pagination pagination={pagination} onPageChange={onPageChange} />
          )}
        </>
      )}
    </div>
  );
};

export default PropertyList;
