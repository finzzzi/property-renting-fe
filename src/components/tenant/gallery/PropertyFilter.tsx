"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import type { Property } from "@/lib/types/tenant";

interface PropertyFilterProps {
  properties: Property[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  isLoading: boolean;
}

export function PropertyFilter({
  properties,
  selectedValue,
  onValueChange,
  isLoading,
}: PropertyFilterProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Pilih Properti:</span>
      </div>
      <Select
        value={selectedValue}
        onValueChange={onValueChange}
        disabled={isLoading || properties.length === 0}
      >
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Pilih properti untuk melihat foto" />
        </SelectTrigger>
        <SelectContent>
          {properties.map((property) => (
            <SelectItem key={property.id} value={property.id.toString()}>
              {property.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
