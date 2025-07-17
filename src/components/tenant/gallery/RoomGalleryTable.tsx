"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Camera, MoreHorizontal, Upload, Trash2 } from "lucide-react";
import type { RoomWithPictures } from "@/lib/types/tenant";

interface RoomGalleryTableProps {
  rooms: RoomWithPictures[];
  selectedPropertyId: string;
  onDelete: (room: RoomWithPictures) => void;
}

export function RoomGalleryTable({
  rooms,
  selectedPropertyId,
  onDelete,
}: RoomGalleryTableProps) {
  const router = useRouter();

  const getDisplayPicture = (room: RoomWithPictures) => {
    return room.pictures.length > 0 ? room.pictures[0].public_url : null;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">No.</TableHead>
          <TableHead className="w-24">Foto</TableHead>
          <TableHead>Room</TableHead>
          <TableHead className="w-16"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rooms.map((room, index) => {
          const displayPicture = getDisplayPicture(room);
          return (
            <TableRow key={room.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>
                {displayPicture ? (
                  <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                    <Image
                      src={displayPicture}
                      alt={`Foto ${room.name}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center text-center">
                    <Camera className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="font-medium">{room.name}</div>
                <div className="text-sm text-muted-foreground">
                  {room.description}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      disabled={!!displayPicture}
                      onClick={() =>
                        router.push(
                          `/tenant/gallery/rooms/upload/${
                            room.id
                          }?propertyId=${selectedPropertyId}&roomName=${encodeURIComponent(
                            room.name
                          )}&propertyName=${encodeURIComponent(
                            room.property.name
                          )}`
                        )
                      }
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Foto
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={!displayPicture}
                      onClick={() => onDelete(room)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus Foto
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
