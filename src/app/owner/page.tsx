"use client";

import {
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OwnerDashboard() {
  return (
    <div className="aspect-video rounded-xl bg-muted/50">
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">
            Selamat Datang di Dashboard Owner
          </h3>
          <p className="text-sm text-muted-foreground">
            Kelola properti dan reservasi Anda dengan mudah
          </p>
        </div>
      </div>
    </div>
  );
}
