import { AppSidebar } from "@/components/AppSidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import React, { Suspense } from "react"
export default function Page({children}:{children:React.ReactNode}) {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <Suspense fallback={<p>Loading...</p>}>
          {children}
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  )
}