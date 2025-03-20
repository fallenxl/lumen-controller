"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background px-4">
      <SidebarTrigger className="mr-2" />
      <h1 className="text-lg font-semibold">Sistema de Control de Válvulas</h1>
    </header>
  )
}

