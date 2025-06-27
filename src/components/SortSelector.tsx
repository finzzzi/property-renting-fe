"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortAsc } from "lucide-react";
import { SORT_OPTIONS } from "@/lib/types/search";

interface SortSelectorProps {
  sortOption: string;
  onSortChange: (value: string) => void;
}

const SortSelector: React.FC<SortSelectorProps> = ({
  sortOption,
  onSortChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <SortAsc className="h-4 w-4" />
      <Select value={sortOption} onValueChange={onSortChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Urutkan berdasarkan" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SortSelector;
