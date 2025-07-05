"use client";

import {
  Building2,
  Calendar,
  ChevronRight,
  Home,
  Plus,
  Settings,
  Tag,
  TrendingUp,
} from "lucide-react";

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
const data = {
  navMain: [
    {
      title: "Properties",
      url: "#",
      icon: Building2,
      isActive: true,
      items: [
        {
          title: "Properti Saya",
          url: "/owner/properties",
        },
        {
          title: "Tambah Properti",
          url: "/owner/properties/add",
        },
      ],
    },
    {
      title: "Categories",
      url: "#",
      icon: Tag,
      items: [
        {
          title: "Kelola Kategori",
          url: "/owner/categories",
        },
      ],
    },
    {
      title: "Rooms",
      url: "#",
      icon: Home,
      items: [
        {
          title: "Semua Room",
          url: "/owner/rooms",
        },
        {
          title: "Tambah Room",
          url: "/owner/rooms/add",
        },
      ],
    },
    {
      title: "Availability",
      url: "#",
      icon: Calendar,
      items: [
        {
          title: "Pengaturan Ketersediaan",
          url: "/owner/availability",
        },
      ],
    },
    {
      title: "Peak Seasons",
      url: "#",
      icon: TrendingUp,
      items: [
        {
          title: "Manajemen Musim Ramai",
          url: "/owner/peak-seasons",
        },
      ],
    },
  ],
};

export function OwnerSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/owner">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    Owner Dashboard
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
