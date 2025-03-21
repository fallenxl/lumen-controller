import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SidebarInset, SidebarProvider } from './components/ui/sidebar.tsx'
import { AppSidebar } from './components/app-sidebar.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SidebarProvider>

      <SidebarInset className="bg-gradient-to-b from-sky-50 to-white">

        <AppSidebar />
        <App />
      </SidebarInset>
    </SidebarProvider>
  </StrictMode>,
)
