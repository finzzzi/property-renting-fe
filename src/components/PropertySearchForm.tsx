"use client";

import React, { useState } from "react";
import { CalendarIcon, MapPinIcon, UsersIcon, ClockIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

import citiesData from "../../public/data/cities.json";

interface City {
  id: number;
  type: string;
  name: string;
}

const cities: City[] = citiesData;

const PropertySearchForm = () => {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [duration, setDuration] = useState<string>("");
  const [guests, setGuests] = useState<string>("");
  const [cityPopoverOpen, setCityPopoverOpen] = useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  const handleSearch = () => {
    if (!selectedCity || !checkInDate || !duration || !guests) {
      alert("Mohon lengkapi semua field pencarian");
      return;
    }

    const searchData = {
      city: selectedCity,
      checkIn: checkInDate,
      duration: duration,
      guests: guests,
    };

    console.log(searchData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPinIcon className="h-4 w-4" />
              Kota/Kabupaten
            </label>
            <Popover open={cityPopoverOpen} onOpenChange={setCityPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={cityPopoverOpen}
                  className="w-full justify-between"
                >
                  {selectedCity
                    ? `${selectedCity.type} ${selectedCity.name}`
                    : "Pilih kota/kabupaten"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Cari kota/kabupaten" />
                  <CommandList>
                    <CommandEmpty>
                      Tidak ada kota/kabupaten ditemukan.
                    </CommandEmpty>
                    <CommandGroup>
                      {cities.map((city) => (
                        <CommandItem
                          key={city.id}
                          value={`${city.type} ${city.name}`}
                          onSelect={() => {
                            setSelectedCity(city);
                            setCityPopoverOpen(false);
                          }}
                        >
                          <span className="text-xs text-gray-500 mr-2">
                            {city.type}
                          </span>
                          {city.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Tanggal Check-in
              </label>
              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkInDate && "text-muted-foreground"
                    )}
                  >
                    {checkInDate ? (
                      format(checkInDate, "PPP", { locale: id })
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={checkInDate}
                    onSelect={(date) => {
                      setCheckInDate(date);
                      setDatePopoverOpen(false);
                    }}
                    disabled={(date) =>
                      date < new Date() || date < new Date("1900-01-01")
                    }
                    locale={id}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                Durasi Menginap
              </label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih durasi" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((night) => (
                    <SelectItem key={night} value={night.toString()}>
                      {night} malam
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                Jumlah Tamu
              </label>
              <Select value={guests} onValueChange={setGuests}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih jumlah tamu" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((person) => (
                    <SelectItem key={person} value={person.toString()}>
                      {person} orang
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleSearch}
                size="lg"
                className="w-full md:w-auto px-8 md:px-15 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-md"
              >
                Cari Penginapan
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertySearchForm;
