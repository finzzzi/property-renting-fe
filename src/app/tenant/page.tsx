"use client";

import { Building2 } from "lucide-react";

export default function TenantDashboard() {
  return (
    <div className="aspect-video rounded-xl bg-muted/50">
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">
            Selamat Datang di Dashboard Tenant
          </h3>
          <p className="text-sm text-muted-foreground">
            Silakan pilih menu di sebelah kiri untuk mengelola properti dan
            reservasi
          </p>
        </div>
      </div>
    </div>
  );
}
