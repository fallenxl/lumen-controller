import ValveControlDashboard from "@/components/valve-control-dashboard"

import { AppHeader } from "./components/app-header";

export default function App() {
  return (
    <main className="min-h-screen">
      <AppHeader />
      <div className="p-4 md:p-8">
        <ValveControlDashboard />
      </div>
    </main>
  )
}

