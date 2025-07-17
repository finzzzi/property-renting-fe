"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { Loader2 } from "lucide-react";

type PeakForm = {
  type: "percentage" | "fixed";
  value: string;
  range?: DateRange;
};

interface AddEditPeakSeasonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  form: PeakForm | null;
  onFormChange: (change: Partial<PeakForm>) => void;
  onSave: () => void;
  isEditing: boolean;
  submitting: boolean;
  error?: string | null;
}

// Helper
const formatInputValue = (val: string) => {
  const numeric = val.replace(/[^\\d]/g, "");
  if (!numeric) return "";
  return new Intl.NumberFormat("id-ID").format(parseInt(numeric));
};

export const AddEditPeakSeasonDialog = ({
  isOpen,
  onClose,
  form,
  onFormChange,
  onSave,
  isEditing,
  submitting,
  error,
}: AddEditPeakSeasonDialogProps) => {
  if (!form) return null;

  const handleValueChange = (val: string) => {
    if (form.type === "fixed") {
      onFormChange({ value: val.replace(/[^\\d]/g, "") });
    } else {
      onFormChange({ value: val.replace(/[^\\d]/g, "") });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Peak Season" : "Tambah Peak Season"}
          </DialogTitle>
          <DialogDescription>
            Pilih rentang tanggal dan atur kenaikan harga.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Calendar
            mode="range"
            selected={form.range}
            onSelect={(range) => onFormChange({ range })}
            className="rounded-md border"
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipe Harga</label>
              <Select
                value={form.type}
                onValueChange={(type: "percentage" | "fixed") =>
                  onFormChange({ type })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Persentase (%)</SelectItem>
                  <SelectItem value="fixed">Nominal (IDR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nilai</label>
              <input
                type="text"
                inputMode="numeric"
                value={
                  form.type === "fixed"
                    ? formatInputValue(form.value)
                    : form.value
                }
                onChange={(e) => handleValueChange(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                placeholder={form.type === "percentage" ? "%" : "Rp"}
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button
            onClick={onSave}
            disabled={submitting || !form.range?.from || !form.value}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
