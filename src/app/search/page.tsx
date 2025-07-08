"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import SearchHeader from "@/components/SearchHeader";
import FilterSidebar from "@/components/FilterSidebar";
import PropertyList from "@/components/PropertyList";
import { usePropertySearch } from "@/hooks/usePropertySearch";
import { SearchParams } from "@/lib/types/search";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Komponen terpisah yang menggunakan useSearchParams
const SearchContent = () => {
  const searchParams = useSearchParams();
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Get search parameters from URL
  const currentSearchParams: SearchParams = {
    city_id: searchParams.get("city_id") || "",
    check_in: searchParams.get("check_in") || "",
    check_out: searchParams.get("check_out") || "",
    guests: searchParams.get("guests") || "",
    page: searchParams.get("page") || "1",
    property_name: searchParams.get("property_name") || "",
    category_name: searchParams.get("category_name") || "",
    sort_by: searchParams.get("sort_by") || "",
    sort_order: searchParams.get("sort_order") || "",
  };

  // Use custom hook for search functionality
  const {
    properties,
    pagination,
    loading,
    error,
    propertyNameFilter,
    selectedCategories,
    sortOption,
    availableCategories,
    setPropertyNameFilter,
    handleFilter,
    handleSort,
    handlePageChange,
    handleCategoryChange,
  } = usePropertySearch(currentSearchParams);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with search form */}
      <SearchHeader searchParams={currentSearchParams} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-4">
          <Button
            onClick={() => setIsFilterVisible(!isFilterVisible)}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {isFilterVisible ? "Sembunyikan Filter" : "Tampilkan Filter"}
          </Button>
        </div>

        {/* Mobile Filter - Show/Hide based on state */}
        <div
          className={`lg:hidden mb-6 ${isFilterVisible ? "block" : "hidden"}`}
        >
          <FilterSidebar
            propertyNameFilter={propertyNameFilter}
            setPropertyNameFilter={setPropertyNameFilter}
            selectedCategories={selectedCategories}
            availableCategories={availableCategories}
            loading={loading}
            onCategoryChange={handleCategoryChange}
            onApplyFilter={handleFilter}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar Filter */}
          <div className="hidden lg:block">
            <FilterSidebar
              propertyNameFilter={propertyNameFilter}
              setPropertyNameFilter={setPropertyNameFilter}
              selectedCategories={selectedCategories}
              availableCategories={availableCategories}
              loading={loading}
              onCategoryChange={handleCategoryChange}
              onApplyFilter={handleFilter}
            />
          </div>

          {/* Property List */}
          <PropertyList
            properties={properties}
            searchParams={currentSearchParams}
            pagination={pagination}
            loading={loading}
            error={error}
            sortOption={sortOption}
            onSortChange={handleSort}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

// Loading fallback component
const SearchPageLoading = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header skeleton */}
        <Skeleton className="h-12 w-full rounded-md" />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar skeleton */}
          <div className="w-full lg:w-1/4 space-y-4">
            <Skeleton className="h-6 w-32" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>

          {/* Property list skeleton */}
          <div className="w-full lg:w-3/4 space-y-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Komponen utama dengan Suspense boundary
const SearchPage = () => {
  return (
    <Suspense fallback={<SearchPageLoading />}>
      <SearchContent />
    </Suspense>
  );
};

export default SearchPage;
