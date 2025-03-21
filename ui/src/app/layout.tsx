import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema de Control de Válvulas",
  description: "Aplicación para controlar válvulas de agua",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-gradient-to-b from-sky-50 to-white">{children}</SidebarInset>
          </SidebarProvider>
      </body>
    </html>
  )
}
