"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

interface CalendarDayInfo {
  date: string; // YYYY-MM-DD
  is_available: boolean;
  min_price: number | null;
}

interface DateRangeCalendarProps {
  propertyId: string;
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
}

/**
 * Calendar with range selection that shows daily price (in thousands) and availability.
 */
const DateRangeCalendar: React.FC<DateRangeCalendarProps> = ({
  propertyId,
  value,
  onChange,
}) => {
  const [range, setRange] = useState<DateRange | undefined>(value);
  const [month, setMonth] = useState<Date>(() => value?.from ?? new Date());
  const [calendarData, setCalendarData] = useState<
    Record<string, CalendarDayInfo>
  >({});

  const fetchCalendarData = useCallback(
    async (date: Date) => {
      try {
        const year = date.getFullYear();
        const monthIndex = date.getMonth() + 1; // JS month is 0-based
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/properties/${propertyId}/calendar?year=${year}&month=${monthIndex}`
        );
        if (!res.ok) {
          throw new Error("Gagal memuat kalender");
        }
        const json = await res.json();
        const map: Record<string, CalendarDayInfo> = {};
        json.data.calendar.forEach((d: any) => {
          map[d.date] = {
            date: d.date,
            is_available: d.is_available,
            min_price: d.min_price,
          };
        });
        setCalendarData(map);
      } catch (err) {
        console.error(err);
      }
    },
    [propertyId]
  );

  useEffect(() => {
    fetchCalendarData(month);
  }, [fetchCalendarData, month]);

  const getDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  const disabledDay = (day: Date) => {
    const key = getDateKey(day);
    const info = calendarData[key];
    // Disable if not available or date in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (day < today) return true;
    if (!info) return true;
    return !info.is_available;
  };

  const CustomDayButton = ({ children, modifiers, day, ...props }: any) => {
    const key = getDateKey(day.date);
    const info = calendarData[key];
    let footer = "";
    if (info) {
      if (info.is_available && info.min_price != null) {
        footer = (info.min_price / 1000).toString();
      } else {
        footer = "✕";
      }
    }
    return (
      <CalendarDayButton day={day} modifiers={modifiers} {...props}>
        {children}
        {!modifiers.outside && <span>{footer}</span>}
      </CalendarDayButton>
    );
  };

  const handleSelect = (selection: DateRange | undefined) => {
    setRange(selection);
    onChange?.(selection);
  };

  return (
    <Calendar
      mode="range"
      selected={range}
      onSelect={handleSelect}
      numberOfMonths={1}
      month={month}
      onMonthChange={setMonth}
      disabled={disabledDay}
      captionLayout="dropdown"
      components={{
        DayButton: CustomDayButton,
      }}
      className="w-full p-0 [--cell-size:--spacing(9)] md:[--cell-size:--spacing(12)]"
    />
  );
};

export default DateRangeCalendar;
