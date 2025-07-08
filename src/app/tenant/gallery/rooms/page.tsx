"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  MoreHorizontal,
  Upload,
  Trash2,
  Loader2,
  Camera,
  Filter,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import Image from "next/image";

interface RoomPicture {
  id: number;
  file_path: string;
  created_at: string;
  public_url: string;
}

interface RoomWithPictures {
  id: number;
  name: string;
  max_guests: number;
  property_id: number;
  property: {
    id: number;
    name: string;
    location: string;
  };
  pictures: RoomPicture[];
  has_pictures: boolean;
  picture_count: number;
}

interface Property {
  id: number;
  name: string;
  address: string;
}

interface RoomsResponse {
  success: true;
  data: {
    property: {
      id: number;
      name: string;
      location: string;
    };
    rooms: RoomWithPictures[];
    message?: string;
  };
}

interface PropertyResponse {
  success: boolean;
  message: string;
  data: Property[];
}

interface ErrorResponse {
  success: false;
  message: string;
}

export default function RoomGalleryPage() {
  const [rooms, setRooms] = useState<RoomWithPictures[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);
  const { session, loading: authLoading } = useAuth();
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (session) {
      fetchProperties();
    }
  }, [session]);

  useEffect(() => {
    if (session && selectedProperty) {
      fetchRooms();
    }
  }, [selectedProperty]);

  const fetchProperties = async () => {
    if (!session?.access_token) {
      setLoadingProperties(false);
      return;
    }

    try {
      setLoadingProperties(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/properties/my-properties?all=true`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Gagal mengambil data properti: ${response.status}`);
      }

      const data: PropertyResponse = await response.json();
      setProperties(data.data);
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setLoadingProperties(false);
    }
  };

  const fetchRooms = async () => {
    if (!session?.access_token || !selectedProperty) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/pictures/all-room-pictures?property_id=${selectedProperty}`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Token tidak valid atau sudah expired. Silakan login kembali."
          );
        }
        const errorData: ErrorResponse = await response.json();
        throw new Error(
          errorData.message || `Gagal mengambil data room: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Gagal mengambil data room");
      }

      // Handle response with property and rooms
      if (data.data.rooms && data.data.rooms.length > 0) {
        setRooms(data.data.rooms);
        setEmptyMessage(null);
      } else {
        setRooms([]);
        setEmptyMessage(
          data.data.message || "Properti ini belum memiliki room"
        );
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setRooms([]);
      setEmptyMessage(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyFilterChange = (value: string) => {
    setSelectedProperty(value);
    setRooms([]); // Reset rooms when changing property
    setError(null); // Clear any previous errors
    setEmptyMessage(null); // Clear empty message
  };

  const getDisplayPicture = (room: RoomWithPictures) => {
    return room.pictures.length > 0 ? room.pictures[0].public_url : null;
  };

  const hasRoomPicture = (room: RoomWithPictures) => {
    return room.has_pictures && room.pictures.length > 0;
  };

  if (authLoading || (loading && selectedProperty)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-48" />
        </div>
        <Card>
          <CardContent className="p-0">
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
                {[...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-16 w-16 rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Galeri Foto Room
            </h1>
            <p className="text-muted-foreground">
              Kelola foto-foto room properti Anda
            </p>
          </div>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Foto Room
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Terjadi Kesalahan</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => fetchRooms()} variant="outline">
                Coba Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Galeri Foto Room
          </h1>
          <p className="text-muted-foreground">
            Kelola foto-foto room properti Anda
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Foto Room
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Pilih Properti:</span>
        </div>
        <Select
          value={selectedProperty}
          onValueChange={handlePropertyFilterChange}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Pilih properti untuk melihat room" />
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

      {/* Info text */}
      {selectedProperty && (
        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border">
          <p>
            Setiap room hanya dapat memiliki <strong>1 foto</strong>.
          </p>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {!selectedProperty ? (
            <div className="text-center py-12">
              <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Pilih Properti</h3>
              <p className="text-muted-foreground mb-4">
                Silakan pilih properti dari dropdown di atas untuk melihat
                foto-foto room yang tersedia.
              </p>
            </div>
          ) : rooms.length === 0 && emptyMessage ? (
            <div className="text-center py-12">
              <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Belum Ada Room</h3>
              <p className="text-muted-foreground mb-4">{emptyMessage}</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Belum Ada Room</h3>
              <p className="text-muted-foreground mb-4">
                Properti yang dipilih belum memiliki room.
              </p>
            </div>
          ) : (
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
                {rooms.map((room, index) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      {hasRoomPicture(room) ? (
                        <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                          <Image
                            src={getDisplayPicture(room)!}
                            alt={`Foto ${room.name}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                          <div className="text-center">
                            <Camera className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                            <span className="text-xs text-muted-foreground">
                              Belum ada foto
                            </span>
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{room.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Max {room.max_guests} tamu
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            disabled
                            className="text-muted-foreground"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Foto
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled
                            className="text-muted-foreground"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus Foto
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
