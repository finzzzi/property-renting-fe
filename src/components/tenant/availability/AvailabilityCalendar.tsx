"use client";

import { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Loader2 } from "lucide-react";
import type { Unavailability } from "@/lib/types/tenant";

interface AvailabilityCalendarProps {
  unavailabilities: Unavailability[];
  month: Date;
  onMonthChange: (date: Date) => void;
  isLoading: boolean;
  isRoomSelected: boolean;
}

export function AvailabilityCalendar({
  unavailabilities,
  month,
  onMonthChange,
  isLoading,
  isRoomSelected,
}: AvailabilityCalendarProps) {
  const unavailableDates = useMemo(() => {
    const dates: Date[] = [];
    const stripTime = (d: Date) => {
      const _d = new Date(d);
      _d.setHours(0, 0, 0, 0);
      return _d;
    };
    unavailabilities.forEach((u) => {
      const start = stripTime(new Date(u.start_date));
      const end = stripTime(new Date(u.end_date));
      let d = new Date(start);
      while (d <= end) {
        dates.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
    });
    return dates;
  }, [unavailabilities]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[300px]">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  if (!isRoomSelected) {
    return (
      <div className="flex justify-center items-center h-full min-h-[300px] text-center text-muted-foreground p-4">
        Silakan pilih properti dan room terlebih dahulu untuk melihat kalender.
      </div>
    );
  }

  return (
    <Calendar
      className="mx-auto"
      month={month}
      onMonthChange={onMonthChange}
      numberOfMonths={1}
      showOutsideDays
      modifiers={{ unavailable: unavailableDates }}
      modifiersClassNames={{ unavailable: "bg-red-400 text-white rounded-md" }}
      captionLayout="dropdown"
    />
  );
}
