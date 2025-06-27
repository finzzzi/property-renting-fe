"use client";

import { useState, useEffect } from "react";
import {
  Property,
  SearchParams,
  SearchResponse,
  CategoryWithCount,
  SORT_OPTIONS,
} from "@/lib/types/search";

export const usePropertySearch = (initialSearchParams: SearchParams) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<
    SearchResponse["pagination"] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and sort states
  const [propertyNameFilter, setPropertyNameFilter] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("");

  // Categories with counts from search response
  const [availableCategories, setAvailableCategories] = useState<
    CategoryWithCount[]
  >([]);

  const searchProperties = async (params: SearchParams) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      searchParams.set("city_id", params.city_id);
      searchParams.set("check_in", params.check_in);
      searchParams.set("check_out", params.check_out);
      searchParams.set("guests", params.guests);
      searchParams.set("page", params.page);

      if (params.property_name) {
        searchParams.set("property_name", params.property_name);
      }
      if (params.category_name) {
        searchParams.set("category_name", params.category_name);
      }
      if (params.sort_by) {
        searchParams.set("sort_by", params.sort_by);
      }
      if (params.sort_order) {
        searchParams.set("sort_order", params.sort_order);
      }

      const queryString = searchParams.toString();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/properties/search?${queryString}`
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data property");
      }

      const data: SearchResponse = await response.json();

      if (data.success) {
        setProperties(data.data || []);
        setPagination(data.pagination);

        // Process categories with counts
        const categoryCount: { [key: string]: number } = {};

        // Count properties per category from current results
        if (data.data && Array.isArray(data.data)) {
          data.data.forEach((property) => {
            categoryCount[property.category] =
              (categoryCount[property.category] || 0) + 1;
          });
        }

        // Get unique categories from response
        const uniqueCategories =
          data.categories && Array.isArray(data.categories)
            ? [...new Set(data.categories.map((cat) => cat.name))]
            : [];

        // Create category list with counts
        const categoriesWithCount: CategoryWithCount[] = uniqueCategories.map(
          (categoryName) => ({
            name: categoryName,
            count: categoryCount[categoryName] || 0,
          })
        );

        setAvailableCategories(categoriesWithCount);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const updateURL = (params: SearchParams) => {
    const searchParams = new URLSearchParams();
    searchParams.set("city_id", params.city_id);
    searchParams.set("check_in", params.check_in);
    searchParams.set("check_out", params.check_out);
    searchParams.set("guests", params.guests);
    searchParams.set("page", params.page);

    if (params.property_name) {
      searchParams.set("property_name", params.property_name);
    }
    if (params.category_name) {
      searchParams.set("category_name", params.category_name);
    }
    if (params.sort_by) {
      searchParams.set("sort_by", params.sort_by);
    }
    if (params.sort_order) {
      searchParams.set("sort_order", params.sort_order);
    }

    window.history.pushState(null, "", `/search?${searchParams.toString()}`);
  };

  const handleFilter = () => {
    const newParams = {
      ...initialSearchParams,
      page: "1",
      property_name: propertyNameFilter,
      category_name:
        selectedCategories.length > 0 ? selectedCategories.join(",") : "",
    };

    if (sortOption) {
      const selectedSort = SORT_OPTIONS.find((opt) => opt.value === sortOption);
      if (selectedSort) {
        newParams.sort_by = selectedSort.sort_by;
        newParams.sort_order = selectedSort.sort_order;
      }
    }

    updateURL(newParams);
    searchProperties(newParams);
  };

  const handleSort = (value: string) => {
    setSortOption(value);
    const selectedSort = SORT_OPTIONS.find((opt) => opt.value === value);

    if (selectedSort) {
      const newParams = {
        ...initialSearchParams,
        page: "1",
        property_name: propertyNameFilter,
        category_name:
          selectedCategories.length > 0 ? selectedCategories.join(",") : "",
        sort_by: selectedSort.sort_by,
        sort_order: selectedSort.sort_order,
      };

      updateURL(newParams);
      searchProperties(newParams);
    }
  };

  const handlePageChange = (newPage: number) => {
    const newParams = {
      ...initialSearchParams,
      page: newPage.toString(),
      property_name: propertyNameFilter,
      category_name:
        selectedCategories.length > 0 ? selectedCategories.join(",") : "",
    };

    if (sortOption) {
      const selectedSort = SORT_OPTIONS.find((opt) => opt.value === sortOption);
      if (selectedSort) {
        newParams.sort_by = selectedSort.sort_by;
        newParams.sort_order = selectedSort.sort_order;
      }
    }

    updateURL(newParams);
    searchProperties(newParams);
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const updatedCategories = checked
      ? [...selectedCategories, category]
      : selectedCategories.filter((c) => c !== category);

    setSelectedCategories(updatedCategories);
  };

  // Initialize from URL params
  useEffect(() => {
    if (
      initialSearchParams.city_id &&
      initialSearchParams.check_in &&
      initialSearchParams.check_out &&
      initialSearchParams.guests
    ) {
      // Initialize filter states from URL
      setPropertyNameFilter(initialSearchParams.property_name || "");
      setSelectedCategories(
        initialSearchParams.category_name
          ? initialSearchParams.category_name.split(",")
          : []
      );

      if (initialSearchParams.sort_by && initialSearchParams.sort_order) {
        const sortValue = `${initialSearchParams.sort_by}-${initialSearchParams.sort_order}`;
        setSortOption(sortValue);
      }

      searchProperties(initialSearchParams);
    } else {
      setLoading(false);
    }
  }, []);

  return {
    // State
    properties,
    pagination,
    loading,
    error,
    propertyNameFilter,
    selectedCategories,
    sortOption,
    availableCategories,

    // State setters
    setPropertyNameFilter,

    // Handlers
    handleFilter,
    handleSort,
    handlePageChange,
    handleCategoryChange,
  };
};
