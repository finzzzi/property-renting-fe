import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Bed } from "lucide-react";
import { SearchParams } from "@/lib/types/search";

interface Room {
  id: number;
  name: string;
  price: number;
  description: string;
  max_guests: number;
  picture: string;
  created_at: string;
  updated_at: string;
  property_id: number;
  quantity: number;
  bookings: any[];
  room_unavailabilities: any[];
  peak_season_rates: any[];
  available_quantity: number;
  final_price: number;
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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleBookRoom = (room: Room) => {
    alert(`Booking kamar ${room.name} akan diimplementasikan nanti`);
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

  return (
    <div className="space-y-6">
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
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/room-image//${room.picture}`}
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
                        {formatCurrency(room.final_price)}
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
    </div>
  );
};

export default RoomList;
