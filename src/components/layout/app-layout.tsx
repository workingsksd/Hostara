import { Sidebar, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./sidebar"
import { AppHeader } from "./header"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </>
  )
}
