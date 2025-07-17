import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { PeakForm } from "@/hooks/usePeakSeasonFormV2";
import { Room } from "@/hooks/usePeakSeasonDataV2";

interface PeakSeasonDialogV2Props {
  showAddDialog: boolean;
  showEditDialog: boolean;
  pendingForm: PeakForm | null;
  selectedRoom: string;
  rooms: Room[];
  onClose: () => void;
  onFormChange: (form: PeakForm) => void;
  onSave: () => void;
  formatInputValue: (val: string) => string;
  handleValueChange: (val: string) => void;
}

export function PeakSeasonDialogV2({
  showAddDialog,
  showEditDialog,
  pendingForm,
  selectedRoom,
  rooms,
  onClose,
  onFormChange,
  onSave,
  formatInputValue,
  handleValueChange,
}: PeakSeasonDialogV2Props) {
  const formatDate = (d: Date) =>
    d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const isOpen = showAddDialog || showEditDialog;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="w-[340px] sm:w-[420px] md:w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {showEditDialog ? "Edit Peak Season" : "Tambah Peak Season"}
          </DialogTitle>
          <DialogDescription>
            Pilih rentang tanggal dan atur harga khusus
          </DialogDescription>
        </DialogHeader>

        {/* Form */}
        <div className="space-y-4">
          <Calendar
            mode="range"
            numberOfMonths={1}
            selected={pendingForm?.range}
            onSelect={(r) =>
              pendingForm && onFormChange({ ...pendingForm, range: r })
            }
            captionLayout="dropdown"
            className="mx-auto"
          />
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="text-sm font-medium">Tipe Harga</label>
              <Select
                value={pendingForm?.type}
                onValueChange={(v) =>
                  pendingForm &&
                  onFormChange({
                    ...pendingForm,
                    type: v as "percentage" | "fixed",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed (IDR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Value</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={
                  pendingForm
                    ? pendingForm.type === "fixed"
                      ? formatInputValue(pendingForm.value)
                      : pendingForm.value
                    : ""
                }
                onChange={(e) => handleValueChange(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        {pendingForm?.range?.from &&
          pendingForm.value &&
          (() => {
            const roomName =
              rooms.find((r) => r.id.toString() === selectedRoom)?.name || "";
            const startStr = formatDate(pendingForm.range!.from);
            const endStr = formatDate(
              pendingForm.range!.to ?? pendingForm.range!.from
            );
            const sameDay =
              !pendingForm.range!.to ||
              pendingForm.range!.from.toDateString() ===
                pendingForm.range!.to.toDateString();
            const descValue =
              pendingForm.type === "percentage"
                ? `${pendingForm.value} %`
                : Number(pendingForm.value).toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  });
            return (
              <p className="text-sm text-center my-2">
                Kamar {roomName} akan dikenakan kenaikan harga sebesar{" "}
                {descValue} {sameDay ? "pada tanggal" : "mulai"} {startStr}
                {sameDay ? "" : ` sampai ${endStr}`}
              </p>
            );
          })()}

        <DialogFooter>
          <Button
            onClick={onSave}
            disabled={!pendingForm?.range?.from || !pendingForm.value}
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
