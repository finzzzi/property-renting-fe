import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Property {
  id: number;
  name: string;
}

interface Room {
  id: number;
  name: string;
  price?: number;
}

interface PropertyRoomFilterProps {
  properties: Property[];
  rooms: Room[];
  selectedProperty: string;
  selectedRoom: string;
  onPropertyChange: (value: string) => void;
  onRoomChange: (value: string) => void;
  isLoadingRooms?: boolean;
  propertyLabel?: string;
  roomLabel?: string;
  propertyPlaceholder?: string;
  roomPlaceholder?: string;
}

export function PropertyRoomFilter({
  properties,
  rooms,
  selectedProperty,
  selectedRoom,
  onPropertyChange,
  onRoomChange,
  isLoadingRooms = false,
  propertyLabel = "Properti:",
  roomLabel = "Room:",
  propertyPlaceholder = "Pilih Properti",
  roomPlaceholder = "Pilih Room",
}: PropertyRoomFilterProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <label className="text-sm font-medium text-muted-foreground">
          {propertyLabel}
        </label>
      </div>
      <Select value={selectedProperty} onValueChange={onPropertyChange}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder={propertyPlaceholder} />
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
              {roomLabel}
            </label>
          </div>
          <Select
            value={selectedRoom}
            onValueChange={onRoomChange}
            disabled={isLoadingRooms}
          >
            <SelectTrigger className="w-64">
              <SelectValue
                placeholder={isLoadingRooms ? "Memuat..." : roomPlaceholder}
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
