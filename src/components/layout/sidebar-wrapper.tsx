
'use client';

import {
  Sidebar,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { ChevronDown } from "lucide-react";
import { useUser } from "@/firebase";

// This is a wrapper component because the main sidebar needs to be a client component
// to access localStorage, but we want to keep the wrapping <Sidebar> component as clean as possible.
export function AppSidebar({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  return (
    <Sidebar variant="inset" collapsible="icon">
      {children}
      <SidebarSeparator />
      <SidebarFooter>
        <div className="flex items-center gap-2 p-2">
            <div className="size-10 rounded-full bg-muted-foreground/20 shrink-0 group-data-[collapsible=icon]:mx-auto" />
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold">{user?.displayName || 'Admin'}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
            </div>
            <ChevronDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
