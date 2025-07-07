"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPinIcon, CalendarDays, Hotel } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Property, SearchParams } from "@/lib/types/search";

interface PropertyCardProps {
  property: Property;
  searchParams: SearchParams;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  searchParams,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDateIndonesian = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d MMMM yyyy", { locale: id });
  };

  const handleViewDetail = () => {
    window.location.href = `/property/${property.property_id}?check_in=${searchParams.check_in}&check_out=${searchParams.check_out}&guests=${searchParams.guests}`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow py-0">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Property Image */}
          <div className="relative h-48 md:h-full">
            <Image
              src={
                property.property_pictures
                  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-pictures//${property.property_pictures}`
                  : "/placeholder-property.jpg"
              }
              alt={property.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Property Info */}
          <div className="md:col-span-2 p-6">
            <div className="flex flex-col md:flex-row md:justify-between h-full">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {property.name}
                </h3>

                <div className="flex items-center text-gray-600 mb-2">
                  <Hotel className="h-4 w-4 mr-2" />
                  <span className="text-sm">{property.category}</span>
                </div>

                <div className="flex items-center text-gray-600 mb-2">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm">{property.location}</span>
                </div>

                <div className="text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    <span>
                      {formatDateIndonesian(searchParams.check_in)} -{" "}
                      {formatDateIndonesian(searchParams.check_out)} (
                      {calculateNights(
                        searchParams.check_in,
                        searchParams.check_out
                      )}{" "}
                      malam)
                    </span>
                  </div>
                </div>
              </div>

              {/* Price and Booking */}
              <div className="flex flex-col justify-between md:items-end md:text-right">
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Mulai dari</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatPrice(property.price)}
                  </p>
                  <p className="text-sm text-gray-500">/malam</p>
                </div>

                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={handleViewDetail}
                >
                  Lihat Detail
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
