import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star } from "lucide-react";

interface PropertyPicture {
  id: number;
  file_path: string;
  is_main: boolean;
}

interface City {
  name: string;
  type: string;
}

interface PropertyDetailProps {
  property: {
    property_id: number;
    name: string;
    description: string;
    location: string;
    category: string;
    city: City;
    property_pictures: PropertyPicture[];
  };
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ property }) => {
  const mainPicture = property.property_pictures.find((pic) => pic.is_main);
  const imageUrl = mainPicture
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-pictures//${mainPicture.file_path}`
    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-pictures//placeholder.png`;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow py-0 gap-0">
      <div className="relative">
        {/* Main Image */}
        <div className="h-80 md:h-96 overflow-hidden relative rounded-lg">
          <Image
            src={imageUrl}
            alt={property.name}
            fill
            className="object-cover"
            onError={() => {
              // Image error handling will be done by Next.js
            }}
          />
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {property.category}
          </span>
        </div>
      </div>
      {/* Property Images Gallery */}
      {property.property_pictures.filter((pic) => !pic.is_main).length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {property.property_pictures
              .filter((picture) => !picture.is_main)
              .map((picture) => (
                <div key={picture.id} className="relative h-24 md:h-32">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-pictures//${picture.file_path}`}
                    alt={`${property.name} - Foto ${picture.id}`}
                    fill
                    className="object-cover rounded-lg"
                    onError={() => {
                      // Image error handling will be done by Next.js
                    }}
                  />
                </div>
              ))}
          </div>
        </div>
      )}

      <CardContent className="p-6">
        {/* Property Name */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {property.name}
        </h1>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="text-sm">
            {property.location}, {property.city.name}
          </span>
        </div>

        {/* City Type */}
        <div className="flex items-center mb-4">
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
            {property.city.type} {property.city.name}
          </span>
        </div>

        {/* Description */}
        <div className="">
          <h3 className="text-xl font-semibold mb-3">Tentang Property</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {property.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyDetail;
