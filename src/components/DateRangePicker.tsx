"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DateRangeCalendar from "@/components/DateRangeCalendar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";
import { SearchParams } from "@/lib/types/search";
import { CalendarDays } from "lucide-react";

interface DateRangePickerProps {
  propertyId: string;
  searchParams: SearchParams;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  propertyId,
  searchParams,
}) => {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>(() => {
    if (searchParams.check_in && searchParams.check_out) {
      return {
        from: new Date(searchParams.check_in),
        to: new Date(searchParams.check_out),
      };
    }
    return undefined;
  });

  const router = useRouter();

  const handleApply = () => {
    const getDateKey = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    };

    if (
      range?.from &&
      range?.to &&
      range.from.toDateString() !== range.to.toDateString()
    ) {
      const params = new URLSearchParams(window.location.search);
      params.set("check_in", getDateKey(range.from));
      params.set("check_out", getDateKey(range.to));
      router.push(`/property/${propertyId}?${params.toString()}`);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="text-sm font-medium bg-slate-800 hover:bg-slate-900 text-white hover:text-white"
        >
          <CalendarDays className="w-4 h-4" />
          Ganti Tanggal
        </Button>
      </DialogTrigger>
      <DialogContent
        className="p-4 w-[340px] sm:w-[420px] md:w-[480px]"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle>Pilih Tanggal</DialogTitle>
        </DialogHeader>
        <DateRangeCalendar
          propertyId={propertyId}
          value={range}
          onChange={setRange}
        />
        <Button
          onClick={handleApply}
          disabled={
            !range?.from ||
            !range?.to ||
            range.from.toDateString() === range.to?.toDateString()
          }
          className="mt-3 w-full bg-slate-800 hover:bg-slate-900 text-white"
        >
          Terapkan
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DateRangePicker;
