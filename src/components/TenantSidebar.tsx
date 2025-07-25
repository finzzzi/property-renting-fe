"use client";

import {
  Building2,
  Calendar,
  ChevronRight,
  Home,
  Image,
  Plus,
  Settings,
  Tag,
  TrendingUp,
} from "lucide-react";
import { usePathname } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

// Data untuk menu sidebar
const getNavData = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  const currentSection = segments[1]; // properties, rooms, categories, etc.

  return {
    navMain: [
      {
        title: "Properties",
        url: "#",
        icon: Building2,
        isActive: currentSection === "properties",
        items: [
          {
            title: "Properti Saya",
            url: "/tenant/properties",
          },
          {
            title: "Tambah Properti",
            url: "/tenant/properties/add",
          },
        ],
      },
      {
        title: "Categories",
        url: "#",
        icon: Tag,
        isActive: currentSection === "categories",
        items: [
          {
            title: "Kelola Kategori",
            url: "/tenant/categories",
          },
        ],
      },
      {
        title: "Rooms",
        url: "#",
        icon: Home,
        isActive: currentSection === "rooms",
        items: [
          {
            title: "Room Saya",
            url: "/tenant/rooms",
          },
          {
            title: "Tambah Room",
            url: "/tenant/rooms/add",
          },
        ],
      },
      {
        title: "Gallery",
        url: "#",
        icon: Image,
        isActive: currentSection === "gallery",
        items: [
          {
            title: "Kelola Foto Properti",
            url: "/tenant/gallery/properties",
          },
          {
            title: "Kelola Foto Room",
            url: "/tenant/gallery/rooms",
          },
        ],
      },
      {
        title: "Availability",
        url: "#",
        icon: Calendar,
        isActive: currentSection === "availability",
        items: [
          {
            title: "Pengaturan Ketersediaan",
            url: "/tenant/availability",
          },
        ],
      },
      {
        title: "Peak Seasons",
        url: "#",
        icon: TrendingUp,
        isActive: currentSection === "peak-seasons",
        items: [
          {
            title: "Manajemen Musim Ramai",
            url: "/tenant/peak-seasons",
          },
        ],
      },
    ],
  };
};

export function TenantSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const data = getNavData(pathname);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/tenant">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    Tenant Dashboard
                  </span>
                  <span className="truncate text-xs">Kelola Properti Anda</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
