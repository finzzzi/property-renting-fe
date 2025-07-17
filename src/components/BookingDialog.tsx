import React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, Clock } from "lucide-react";

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  roomName: string;
}

const BookingDialog: React.FC<BookingDialogProps> = ({
  isOpen,
  onClose,
  isLoggedIn,
  roomName,
}) => {
  const router = useRouter();

  const handleLoginRedirect = () => {
    onClose();
    router.push("/login");
  };

  if (!isLoggedIn) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5 text-orange-500" />
              Login Diperlukan
            </DialogTitle>
            <DialogDescription>
              Anda perlu masuk terlebih dahulu untuk dapat memesan kamar.
              Silakan login atau daftar akun baru.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 ">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button
              onClick={handleLoginRedirect}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Login Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Fitur Segera Hadir
          </DialogTitle>
          <DialogDescription>
            Fitur pemesanan kamar sedang dalam tahap pengembangan dan akan
            segera tersedia. Terima kasih atas pengertiannya!
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Mengerti
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
