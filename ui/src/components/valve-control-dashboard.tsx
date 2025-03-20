"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ValveControlCard from "./valve-control-card"
import { EditValveSheet } from "./edit-valve-sheet"
import axios from "axios"
interface Valve {
  name: string
  status: boolean
  location: string
  devEui: string
  applicationId: string,
  isLoading?: boolean,
  lastUpdate?: string,
  batteryLevel?: number,
  totalConsumption: number
}

export default function ValveControlDashboard() {
  // Mock data for valves - in a real app, this would come from an API
  const [valves, setValves] = useState<Valve[]>([])
  const [socket, setSocket] = useState<WebSocket | null>(null)
  // State for edit sheet
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [currentValve, setCurrentValve] = useState<Valve | null>(null)

  useEffect(() => {
    axios.get("/api/devices").then((response) => {
      const parsedData: Valve[] = response.data.devices?.map((valve: any) => ({
        name: valve.name ?? valve.devEui,
        status: valve.valveStatus === 'open',
        location: valve.location ?? "Ubicación desconocida",
        devEui: valve.devEui,
        applicationId: valve.applicationId,
        lastUpdate: valve.lastUpdate,
        batteryLevel: valve.batteryLevel,
        totalConsumption: valve.totalConsumption
      }))
      console.log("📦 Datos de válvulas cargados:", parsedData)
      setValves(parsedData)
    })
  }, [])

  useEffect(() => {
    let retryInterval: NodeJS.Timeout | null = null;

    const connectWebSocket = () => {
      let socket = new WebSocket("ws://localhost:8775")
      setSocket(socket);
      socket.onopen = () => {
        console.log("✅ WebSocket connection established.");
        if (retryInterval) clearInterval(retryInterval);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📩 Mensaje recibido:", data);

          if (data.controlCode === 129 || data.controlCode === 132) {
            setValves((valves) =>
              valves.map((valve) =>
                valve.devEui === data.devEui ? { ...valve, status: data.valveStatus === "open", isLoading: false } : valve
              )
            );
          }
        } catch (error) {
          console.error("❌ Error procesando mensaje:", error);
        }
      };

      socket.onclose = () => {
        console.log("🔴 WebSocket connection closed. Reconnecting...");
        retryInterval = setTimeout(connectWebSocket, 2000);
      };
    };

    connectWebSocket();

    return () => {
      if (socket) socket.close();
      if (retryInterval) clearTimeout(retryInterval);
    };
  }, []);



  const toggleValve = (id: string, valveStatus: boolean) => {
    if (socket) {
      socket.send(JSON.stringify({ devEui: id, valveStatus: valveStatus ? "closed" : "open" }));
      setValves((valves) =>
        valves.map((valve) => (valve.devEui === id ? { ...valve, isLoading: true } : valve))
      );
    }
  }

  const handleEdit = (valve: Valve) => {
    setCurrentValve(valve)
    setEditSheetOpen(true)
  }

  const handleSaveEdit = (id: string, name: string, location: string, status: boolean) => {
    setValves(valves.map((valve) => (valve.devEui === id ? { ...valve, name, location, status } : valve)))
    // In a real application, you would send a request to your backend here
    console.log(`Edited valve ${id}: name=${name}, location=${location}`)
  }

  const handleDelete = (id: string) => {
    setValves(valves.filter((valve) => valve.devEui !== id))
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Estado del Sistema</CardTitle>
          <CardDescription>Resumen del sistema de control de agua</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span>Válvulas Activas:</span>
              <span className="font-medium">
                {valves.filter((v) => v.status).length} / {valves.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Estado del Sistema:</span>
              <span className="font-medium text-green-600">En línea</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">Todas las Válvulas</TabsTrigger>
          <TabsTrigger value="active">Abiertas</TabsTrigger>
          <TabsTrigger value="inactive">Cerradas</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {valves.map((valve) => (
              <ValveControlCard
                key={valve.devEui}
                valve={valve}
                onToggle={() => toggleValve(valve.devEui, valve.status)}
                onEdit={() => handleEdit(valve)}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {valves
              .filter((valve) => valve.status)
              .map((valve) => (
                <ValveControlCard
                  key={valve.devEui}
                  valve={valve}
                  onToggle={() => toggleValve(valve.devEui, valve.status)}
                  onEdit={() => handleEdit(valve)}
                />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="inactive">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {valves
              .filter((valve) => !valve.status)
              .map((valve) => (
                <ValveControlCard
                  key={valve.devEui}
                  valve={valve}
                  onToggle={() => toggleValve(valve.devEui, valve.status)}
                  onEdit={() => handleEdit(valve)}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>



      {/* Edit Sheet */}
      <EditValveSheet
        valve={currentValve}
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        onSave={handleSaveEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}

