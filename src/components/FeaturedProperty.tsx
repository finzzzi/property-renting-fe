"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin } from "lucide-react";

interface Property {
  id: number;
  tenant: string;
  category: string;
  name: string;
  description: string;
  location: string;
  city: {
    type: string;
    name: string;
  };
  price: number;
  picture: string;
  rating: number;
}

const FeaturedProperty = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load data dummy property
    const loadProperties = async () => {
      try {
        const response = await fetch("/data/dummy-property.json");
        const data: Property[] = await response.json();

        const topRatedProperties = data
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 5);

        setProperties(topRatedProperties);
      } catch (error) {
        console.error("Error loading properties:", error);
      }
    };

    loadProperties();
  }, []);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect();

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;

    const startAutoSlide = () => {
      intervalRef.current = setInterval(() => {
        api.scrollNext();
      }, 5000);
    };

    const stopAutoSlide = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    startAutoSlide();

    const handleMouseEnter = () => stopAutoSlide();
    const handleMouseLeave = () => startAutoSlide();

    const carouselElement = api.containerNode();
    carouselElement?.addEventListener("mouseenter", handleMouseEnter);
    carouselElement?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      stopAutoSlide();
      carouselElement?.removeEventListener("mouseenter", handleMouseEnter);
      carouselElement?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [api]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (properties.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-8">
      <div className="container mx-auto">
        <div className="relative">
          <Carousel
            setApi={setApi}
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {properties.map((property, index) => (
                <CarouselItem
                  key={`${property.id}-${index}`}
                  className="pl-2 md:pl-4 basis-4/5 sm:basis-2/5 lg:basis-1/4"
                >
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 py-0 gap-2">
                    <div className="relative h-48">
                      <Image
                        src={property.picture}
                        alt={property.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 25vw"
                        priority={index < 5}
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 z-10">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {property.rating}
                        </span>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
                        {property.name}
                      </h3>

                      <div className="flex items-start gap-1 mb-3">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 line-clamp-2">
                          {property.city.name}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-blue-600">
                            {formatPrice(property.price)}
                          </span>
                          <span className="text-sm text-gray-500">/malam</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="hidden lg:block">
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
          </Carousel>

          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: properties.length }).map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === current % properties.length
                    ? "bg-blue-600"
                    : "bg-gray-300"
                }`}
                onClick={() => api?.scrollTo(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProperty;
