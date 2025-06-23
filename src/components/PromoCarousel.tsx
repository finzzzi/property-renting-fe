"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

const promoImages = [
  "https://gsrmrmnpzzklayfvgezl.supabase.co/storage/v1/object/public/promo-images/1.png",
  "https://gsrmrmnpzzklayfvgezl.supabase.co/storage/v1/object/public/promo-images/2.png",
  "https://gsrmrmnpzzklayfvgezl.supabase.co/storage/v1/object/public/promo-images/3.png",
  "https://gsrmrmnpzzklayfvgezl.supabase.co/storage/v1/object/public/promo-images/4.png",
  "https://gsrmrmnpzzklayfvgezl.supabase.co/storage/v1/object/public/promo-images/5.png",
];

const PromoCarousel = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
      }, 3000);
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
          slidesToScroll: 1,
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {promoImages.map((imageUrl, index) => (
            <CarouselItem
              key={index}
              className="pl-2 md:pl-4 basis-full md:basis-1/3"
            >
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Image
                  src={imageUrl}
                  alt={`Promo ${index + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={index < 3}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="hidden md:block">
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
        </div>
      </Carousel>

      <div className="flex md:hidden justify-center mt-6">
        <div className="flex space-x-2">
          {promoImages.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                current === index
                  ? "bg-gray-800 scale-125"
                  : "bg-gray-300 hover:bg-gray-500"
              }`}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Pergi ke slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromoCarousel;
