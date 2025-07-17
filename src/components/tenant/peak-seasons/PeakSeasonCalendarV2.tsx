import { Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

interface PeakSeasonCalendarV2Props {
  month: Date;
  onMonthChange: (month: Date) => void;
  peakDates: Date[];
  loadingData: boolean;
  selectedRoom: string;
}

export function PeakSeasonCalendarV2({
  month,
  onMonthChange,
  peakDates,
  loadingData,
  selectedRoom,
}: PeakSeasonCalendarV2Props) {
  if (loadingData) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!selectedRoom) {
    return (
      <div className="text-center text-muted-foreground py-8 text-sm">
        Pilih properti dan room terlebih dahulu
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
      modifiers={{ peak: peakDates }}
      modifiersClassNames={{ peak: "bg-sky-400 text-white" }}
      captionLayout="dropdown"
    />
  );
}
