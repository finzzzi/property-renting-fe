"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, Search } from "lucide-react";
import { CategoryWithCount } from "@/lib/types/search";
import { Skeleton } from "@/components/ui/skeleton";

interface FilterSidebarProps {
  propertyNameFilter: string;
  setPropertyNameFilter: (value: string) => void;
  selectedCategories: string[];
  availableCategories: CategoryWithCount[];
  loading: boolean;
  onCategoryChange: (category: string, checked: boolean) => void;
  onApplyFilter: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  propertyNameFilter,
  setPropertyNameFilter,
  selectedCategories,
  availableCategories,
  loading,
  onCategoryChange,
  onApplyFilter,
}) => {
  return (
    <div className="w-full">
      <Card className="lg:sticky lg:top-4 py-0">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 mr-2" />
            <h3 className="text-lg font-semibold">Filter</h3>
          </div>

          {/* Property Name Filter */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="property-name"
                type="text"
                placeholder="Cari nama properti..."
                value={propertyNameFilter}
                onChange={(e) => setPropertyNameFilter(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    onApplyFilter();
                  }
                }}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-3 block">Kategori</Label>
            <div className="space-y-2">
              {availableCategories.length > 0 ? (
                availableCategories.map((category) => (
                  <div
                    key={category.name}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      id={`category-${category.name}`}
                      checked={selectedCategories.includes(category.name)}
                      onChange={(e) =>
                        onCategoryChange(category.name, e.target.checked)
                      }
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <Label
                      htmlFor={`category-${category.name}`}
                      className="text-sm text-gray-700 cursor-pointer flex-1"
                    >
                      {category.name} ({category.count})
                    </Label>
                  </div>
                ))
              ) : loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Tidak ada kategori tersedia
                </div>
              )}
            </div>
          </div>

          {/* Apply Filter Button */}
          <Button
            onClick={onApplyFilter}
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={loading}
          >
            Terapkan Filter
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FilterSidebar;
