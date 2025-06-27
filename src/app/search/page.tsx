"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import SearchHeader from "@/components/SearchHeader";
import FilterSidebar from "@/components/FilterSidebar";
import PropertyList from "@/components/PropertyList";
import { usePropertySearch } from "@/hooks/usePropertySearch";
import { SearchParams } from "@/lib/types/search";

const SearchPage = () => {
  const searchParams = useSearchParams();

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
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filter */}
          <FilterSidebar
            propertyNameFilter={propertyNameFilter}
            setPropertyNameFilter={setPropertyNameFilter}
            selectedCategories={selectedCategories}
            availableCategories={availableCategories}
            loading={loading}
            onCategoryChange={handleCategoryChange}
            onApplyFilter={handleFilter}
          />

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

export default SearchPage;
