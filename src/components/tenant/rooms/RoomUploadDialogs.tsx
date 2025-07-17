import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  uploading: boolean;
  roomName: string;
}

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  uploading,
  roomName,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konfirmasi Upload</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin mengupload foto untuk room{" "}
            <strong>{roomName}</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            Batal
          </Button>
          <Button onClick={onConfirm} disabled={uploading}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengupload...
              </>
            ) : (
              "Ya, Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SuccessDialog({
  open,
  onOpenChange,
  onClose,
}: SuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5" />
            Upload Berhasil
          </DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Kembali ke Galeri
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
