"use client";

import React, { useEffect, useState, useMemo } from "react";
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
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

interface City {
  id: number;
  type: string;
  name: string;
}

interface SearchFormData {
  city_id: string;
  check_in: string;
  check_out: string;
  guests: string;
}

interface PropertySearchFormProps {
  defaultValues?: {
    city_id?: string;
    check_in?: string;
    check_out?: string;
    guests?: string;
  };
  onSearch?: (searchData: SearchFormData) => void;
}

const PropertySearchForm = ({
  defaultValues,
  onSearch,
}: PropertySearchFormProps) => {
  // Helper untuk format tanggal YYYY-MM-DD
  const formatDateToString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Default yang diminta (Jakarta id=159, besok, 2 malam, 2 orang)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultCheckInStr = formatDateToString(tomorrow);
  const defaultCheckOutDate = new Date(tomorrow);
  defaultCheckOutDate.setDate(defaultCheckOutDate.getDate() + 2);
  const defaultCheckOutStr = formatDateToString(defaultCheckOutDate);

  const effectiveDefaults = useMemo(() => {
    return {
      city_id: defaultValues?.city_id ?? "159",
      check_in: defaultValues?.check_in ?? defaultCheckInStr,
      check_out: defaultValues?.check_out ?? defaultCheckOutStr,
      guests: defaultValues?.guests ?? "2",
    } as const;
  }, [defaultValues, defaultCheckInStr, defaultCheckOutStr]);

  // State
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(
    new Date(effectiveDefaults.check_in)
  );
  const initialDuration = (() => {
    const checkIn = new Date(effectiveDefaults.check_in);
    const checkOut = new Date(effectiveDefaults.check_out);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)).toString();
  })();
  const [duration, setDuration] = useState<string>(initialDuration);
  const [guests, setGuests] = useState<string>(effectiveDefaults.guests);
  const [cityPopoverOpen, setCityPopoverOpen] = useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [guestsPopoverOpen, setGuestsPopoverOpen] = useState(false);
  const [guestInput, setGuestInput] = useState<string>("");

  // Reset input filter saat popover dibuka kembali
  useEffect(() => {
    if (guestsPopoverOpen) {
      setGuestInput("");
    }
  }, [guestsPopoverOpen]);

  useEffect(() => {
    const fetchCities = async () => {
      const { data: citiesData } = await supabase.from("cities").select("*");
      setCities(citiesData || []);

      // Set default city berdasarkan effectiveDefaults
      if (effectiveDefaults.city_id && citiesData) {
        const defaultCity = citiesData.find(
          (city) => city.id.toString() === effectiveDefaults.city_id
        );
        if (defaultCity) {
          setSelectedCity(defaultCity);
        }
      }
    };
    fetchCities();
  }, [effectiveDefaults.city_id]);

  // Set other default values jika props berubah
  useEffect(() => {
    if (effectiveDefaults.check_in) {
      setCheckInDate(new Date(effectiveDefaults.check_in));
    }
    if (effectiveDefaults.check_out && effectiveDefaults.check_in) {
      const checkIn = new Date(effectiveDefaults.check_in);
      const checkOut = new Date(effectiveDefaults.check_out);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDuration(diffDays.toString());
    }
    if (effectiveDefaults.guests) {
      setGuests(effectiveDefaults.guests);
    }
  }, [effectiveDefaults]);

  const handleSearch = () => {
    if (!selectedCity || !checkInDate || !duration || !guests) {
      alert("Mohon lengkapi semua field pencarian");
      return;
    }

    // Calculate check_out date based on check_in and duration
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + parseInt(duration));

    const searchData: SearchFormData = {
      city_id: selectedCity.id.toString(),
      check_in: formatDateToString(checkInDate),
      check_out: formatDateToString(checkOutDate),
      guests: guests,
    };

    if (onSearch) {
      onSearch(searchData);
    } else {
      // Default behavior - navigate to search page
      const searchParams = new URLSearchParams();
      searchParams.set("city_id", searchData.city_id);
      searchParams.set("check_in", searchData.check_in);
      searchParams.set("check_out", searchData.check_out);
      searchParams.set("guests", searchData.guests);
      window.location.href = `/search?${searchParams.toString()}`;
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">
              Pilih kota/kabupaten
            </p>
            <Popover open={cityPopoverOpen} onOpenChange={setCityPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={cityPopoverOpen}
                  className="w-full justify-start"
                >
                  <MapPinIcon className="h-4 w-4 " />
                  {selectedCity
                    ? `${selectedCity.type} ${selectedCity.name}`
                    : "Pilih kota/kabupaten"}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0"
                sideOffset={5}
                style={{ width: "var(--radix-popover-trigger-width)" }}
              >
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
              <p className="text-sm font-medium text-gray-500">
                Tanggal Check-in
              </p>
              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkInDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {checkInDate ? (
                      format(checkInDate, "PPP", { locale: id })
                    ) : (
                      <span>Tanggal Check-in</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0"
                  sideOffset={5}
                  style={{
                    minWidth: "var(--radix-popover-trigger-width)",
                  }}
                >
                  <Calendar
                    className="w-full"
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
              <p className="text-sm font-medium text-gray-500">
                Durasi Menginap
              </p>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    <SelectValue placeholder="Durasi" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((night) => (
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
              <p className="text-sm font-medium text-gray-500">Jumlah Tamu</p>
              <Popover
                open={guestsPopoverOpen}
                onOpenChange={setGuestsPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={guestsPopoverOpen}
                    className="w-full justify-start"
                  >
                    <UsersIcon className="h-4 w-4" />
                    {guests ? `${guests} orang` : "Jumlah Tamu"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0"
                  sideOffset={5}
                  style={{ width: "var(--radix-popover-trigger-width)" }}
                >
                  <Command>
                    <CommandInput
                      placeholder="Ketik jumlah tamu atau pilih dari daftar"
                      autoFocus={false}
                      tabIndex={-1}
                      value={guestInput}
                      onValueChange={(value) => {
                        // Only allow numbers
                        const numericValue = value.replace(/[^0-9]/g, "");
                        if (
                          numericValue === "" ||
                          (parseInt(numericValue) > 0 &&
                            parseInt(numericValue) <= 50)
                        ) {
                          setGuestInput(numericValue);
                          setGuests(numericValue);
                        }
                      }}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {guestInput && parseInt(guestInput) > 0
                          ? `${guestInput} orang`
                          : "Masukkan jumlah tamu"}
                      </CommandEmpty>
                      <CommandGroup>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((person) => (
                          <CommandItem
                            key={person}
                            value={person.toString()}
                            onSelect={() => {
                              const strVal = person.toString();
                              setGuests(strVal);
                              setGuestInput(strVal);
                              setGuestsPopoverOpen(false);
                            }}
                          >
                            {person} orang
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleSearch}
                size="sm"
                className="w-full md:w-auto px-8 md:px-15 h-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-md"
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
