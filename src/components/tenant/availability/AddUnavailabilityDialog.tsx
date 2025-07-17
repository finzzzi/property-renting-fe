"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import type { Room } from "@/lib/types/tenant";

interface AddUnavailabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (range: DateRange) => void;
  isSubmitting: boolean;
  selectedRoomId: string;
  rooms: Room[];
}

// Fungsi untuk format tanggal ke bahasa Indonesia
const formatDateToIndonesian = (date: Date): string => {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

export function AddUnavailabilityDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  selectedRoomId,
  rooms,
}: AddUnavailabilityDialogProps) {
  const [range, setRange] = useState<DateRange | undefined>();

  const handleSubmit = () => {
    if (range?.from) {
      // Perbaiki timezone issue dengan menggunakan local date
      const fromDate = new Date(range.from);
      fromDate.setHours(12, 0, 0, 0); // Set ke jam 12 siang untuk menghindari timezone issues

      let toDate = range.to ? new Date(range.to) : new Date(range.from);
      toDate.setHours(12, 0, 0, 0); // Set ke jam 12 siang untuk menghindari timezone issues

      const submitRange: DateRange = {
        from: fromDate,
        to: toDate,
      };
      onSubmit(submitRange);
    }
  };

  const roomName =
    rooms.find((r) => r.id.toString() === selectedRoomId)?.name || "";

  const renderDateText = () => {
    if (!range?.from) return null;

    const fromDate = formatDateToIndonesian(range.from);

    // Jika tidak ada 'to' atau 'to' sama dengan 'from', tampilkan format single date
    if (!range.to || range.from.getTime() === range.to.getTime()) {
      return (
        <p className="text-sm text-center my-2">
          Room <strong>{roomName}</strong> akan tidak tersedia tanggal{" "}
          <strong>{fromDate}</strong>
        </p>
      );
    }

    // Jika ada range tanggal
    const toDate = formatDateToIndonesian(range.to);
    return (
      <p className="text-sm text-center my-2">
        Room <strong>{roomName}</strong> akan tidak tersedia dari{" "}
        <strong>{fromDate}</strong> sampai <strong>{toDate}</strong>
      </p>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[340px] sm:w-[420px] md:w-[480px]">
        <DialogHeader>
          <DialogTitle>Tambah Unavailability</DialogTitle>
          <DialogDescription>
            Pilih tanggal atau rentang tanggal yang ingin ditandai "tidak
            tersedia".
          </DialogDescription>
        </DialogHeader>
        <Calendar
          mode="range"
          numberOfMonths={1}
          selected={range}
          onSelect={setRange}
          captionLayout="dropdown"
          className="mx-auto w-3/4"
        />
        {renderDateText()}
        <Button onClick={handleSubmit} disabled={isSubmitting || !range?.from}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan
        </Button>
      </DialogContent>
    </Dialog>
  );
}
