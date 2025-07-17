"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface SuccessDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  buttonText: string;
}

export function SuccessDialog({
  open,
  onClose,
  title,
  buttonText,
}: SuccessDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent
        className="[&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Check className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
