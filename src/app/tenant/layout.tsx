"use client";

import { TenantSidebar } from "@/components/TenantSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Fungsi untuk mendapatkan breadcrumb berdasarkan path
  const getBreadcrumb = () => {
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 1) {
      return "Dashboard";
    } else if (segments[1] === "properties") {
      if (segments[2] === "add") {
        return "Tambah Properti";
      } else if (segments[2] === "edit") {
        return "Edit Properti";
      }
      return "Properti Saya";
    } else if (segments[1] === "categories") {
      return "Kategori";
    } else if (segments[1] === "rooms") {
      if (segments[2] === "add") {
        return "Tambah Room";
      } else if (segments[2] === "edit") {
        return "Edit Room";
      }
      return "Room Saya";
    } else if (segments[1] === "availability") {
      return "Ketersediaan";
    } else if (segments[1] === "peak-seasons") {
      return "Musim Ramai";
    } else {
      return "Dashboard";
    }
  };

  return (
    <SidebarProvider>
      <TenantSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/tenant">
                    Dashboard Tenant
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{getBreadcrumb()}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
