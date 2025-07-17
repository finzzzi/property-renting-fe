"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import type { Property, Room } from "@/lib/types/tenant";

interface AvailabilityFiltersProps {
  properties: Property[];
  rooms: Room[];
  selectedProperty: string;
  onSelectProperty: (value: string) => void;
  selectedRoom: string;
  onSelectRoom: (value: string) => void;
  isLoadingRooms: boolean;
}

export function AvailabilityFilters({
  properties,
  rooms,
  selectedProperty,
  onSelectProperty,
  selectedRoom,
  onSelectRoom,
  isLoadingRooms,
}: AvailabilityFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <label className="text-sm font-medium text-muted-foreground">
          Properti:
        </label>
      </div>
      <Select value={selectedProperty} onValueChange={onSelectProperty}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Pilih Properti" />
        </SelectTrigger>
        <SelectContent>
          {properties.map((p) => (
            <SelectItem key={p.id} value={p.id.toString()}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedProperty && (
        <>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <label className="text-sm font-medium text-muted-foreground">
              Room:
            </label>
          </div>
          <Select
            value={selectedRoom}
            onValueChange={onSelectRoom}
            disabled={isLoadingRooms}
          >
            <SelectTrigger className="w-64">
              <SelectValue
                placeholder={isLoadingRooms ? "Memuat..." : "Pilih Room"}
              />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((r) => (
                <SelectItem key={r.id} value={r.id.toString()}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
    </div>
  );
}
