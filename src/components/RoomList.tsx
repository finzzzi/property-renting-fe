import React, { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Bed } from "lucide-react";
import { SearchParams } from "@/lib/types/search";
import { useAuth } from "@/contexts/AuthContext";
import DateRangePicker from "./DateRangePicker";
import BookingDialog from "./BookingDialog";

interface RoomPicture {
  id: number;
  file_path: string;
  public_url: string;
}

interface Room {
  id: number;
  name: string;
  price: number;
  description: string;
  max_guests: number;
  quantity: number;
  available_quantity: number;
  final_price: number;
  room_pictures: RoomPicture[];
  peak_season_rates: {
    start_date: string;
    end_date: string;
  }[];
}

interface RoomListProps {
  rooms: Room[];
  searchParams: SearchParams;
  propertyId: string;
}

const RoomList: React.FC<RoomListProps> = ({
  rooms,
  searchParams,
  propertyId,
}) => {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedRoom(null);
  };

  if (!rooms || rooms.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">
          Tidak ada kamar tersedia untuk tanggal yang dipilih
        </p>
      </div>
    );
  }

  // Parse check-in date from URL search params once for all rooms
  const checkInDate = searchParams.check_in
    ? new Date(searchParams.check_in)
    : null;

  return (
    <div className="space-y-6">
      {/* Date picker button */}
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Jenis Kamar</h2>
        <DateRangePicker propertyId={propertyId} searchParams={searchParams} />
      </div>
      {rooms.map((room) => (
        <Card
          key={room.id}
          className="overflow-hidden hover:shadow-lg transition-shadow py-0"
        >
          <div className="flex flex-col md:flex-row">
            {/* Room Image */}
            <div className="md:w-1/3">
              <div className="h-48 md:h-full overflow-hidden relative">
                <Image
                  src={
                    room.room_pictures && room.room_pictures.length > 0
                      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/room-pictures//${room.room_pictures[0].file_path}`
                      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-pictures//placeholder.png`
                  }
                  alt={room.name}
                  fill
                  className="object-cover"
                  onError={() => {
                    // Image error handling will be done by Next.js
                  }}
                />
              </div>
            </div>

            {/* Room Details */}
            <div className="md:w-2/3">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                  <div className="flex-1">
                    {/* Room Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {room.name}
                    </h3>

                    {/* Room Description */}
                    <p className="text-gray-600 mb-4 text-sm">
                      {room.description}
                    </p>

                    {/* Room Info */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          Maks {room.max_guests} tamu
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Bed className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {room.available_quantity} kamar tersedia
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price and Booking */}
                  <div className="md:text-right md:ml-6">
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-orange-600">
                        {/* Tentukan harga yang ditampilkan: gunakan final_price hanya jika check-in berada di rentang peak season */}
                        {(() => {
                          let displayPrice = room.price;

                          if (checkInDate && room.peak_season_rates) {
                            const isPeak = room.peak_season_rates.some(
                              (rate) => {
                                const start = new Date(rate.start_date);
                                const end = new Date(rate.end_date);
                                return (
                                  checkInDate.getTime() >= start.getTime() &&
                                  checkInDate.getTime() <= end.getTime()
                                );
                              }
                            );

                            if (isPeak) {
                              displayPrice = room.final_price;
                            }
                          }

                          return formatCurrency(displayPrice);
                        })()}
                      </div>
                      <div className="text-sm text-gray-500">per malam</div>
                    </div>

                    {/* Booking Button */}
                    <Button
                      onClick={() => handleBookRoom(room)}
                      disabled={room.available_quantity === 0}
                      className={`w-full md:w-auto min-w-[120px] ${
                        room.available_quantity > 0
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : ""
                      }`}
                    >
                      {room.available_quantity > 0
                        ? "Pesan Sekarang"
                        : "Tidak Tersedia"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      ))}

      {/* Booking Dialog */}
      {selectedRoom && (
        <BookingDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          isLoggedIn={!!user}
          roomName={selectedRoom.name}
        />
      )}
    </div>
  );
};

export default RoomList;
