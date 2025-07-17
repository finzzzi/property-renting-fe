import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PeakSeasonConfirmDialogsV2Props {
  showConfirmDialog: boolean;
  deleteTarget: any;
  errorMessage: string | null;
  submitting: boolean;
  onConfirmSave: () => void;
  onConfirmDelete: () => void;
  onCloseConfirm: () => void;
  onCloseDelete: () => void;
  onCloseError: () => void;
}

export function PeakSeasonConfirmDialogsV2({
  showConfirmDialog,
  deleteTarget,
  errorMessage,
  submitting,
  onConfirmSave,
  onConfirmDelete,
  onCloseConfirm,
  onCloseDelete,
  onCloseError,
}: PeakSeasonConfirmDialogsV2Props) {
  return (
    <>
      {/* Confirm Dialog */}
      <Dialog
        open={showConfirmDialog}
        onOpenChange={(o) => {
          if (!o) onCloseConfirm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Peak Season</DialogTitle>
          </DialogHeader>
          <p className="text-center py-4">Apakah data sudah benar?</p>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={onCloseConfirm}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button onClick={onConfirmSave} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Konfirmasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) onCloseDelete();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Peak Season</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Anda yakin ingin menghapus data ini?
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={onCloseDelete}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmDelete}
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog
        open={!!errorMessage}
        onOpenChange={(o) => {
          if (!o) onCloseError();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terjadi Kesalahan</DialogTitle>
          </DialogHeader>
          <p className="text-center py-4">{errorMessage}</p>
          <DialogFooter>
            <Button onClick={onCloseError}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
