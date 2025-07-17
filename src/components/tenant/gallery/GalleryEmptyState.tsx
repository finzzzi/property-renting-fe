"use client";

import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GalleryEmptyStateProps {
  status: "initial" | "empty" | "error";
  message?: string;
  onRetry?: () => void;
}

export function GalleryEmptyState({
  status,
  message,
  onRetry,
}: GalleryEmptyStateProps) {
  const states = {
    initial: {
      title: "Pilih Properti",
      description:
        "Silakan pilih properti dari dropdown di atas untuk melihat foto-foto room yang tersedia.",
    },
    empty: {
      title: "Belum Ada Room",
      description: message || "Properti yang dipilih belum memiliki room.",
    },
    error: {
      title: "Terjadi Kesalahan",
      description: message || "Tidak dapat memuat data. Silakan coba lagi.",
    },
  };

  const { title, description } = states[status];

  return (
    <div className="text-center py-12">
      <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md mx-auto">
        {description}
      </p>
      {status === "error" && onRetry && (
        <Button onClick={onRetry} variant="outline">
          Coba Lagi
        </Button>
      )}
    </div>
  );
}
