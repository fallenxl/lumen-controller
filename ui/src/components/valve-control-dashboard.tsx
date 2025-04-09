import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ValveControlCard from "./valve-control-card"
import { EditValveSheet } from "./edit-valve-sheet"
import { useWebSocket } from "@/hooks/use-websocket"
import { IValve } from "@/interfaces"
import {useValveStore} from '@/store/valves.store'

export default function ValveControlDashboard() {
  const {
    fetchValves,
    valves,
    updateValveStatus,
    setValves

  } = useValveStore(state => state)
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [currentValve, setCurrentValve] = useState<IValve | null>(null)
  const { sendMessage } = useWebSocket(`ws://${window.location.hostname}:8765/`, (data) => {
    if (data.controlCode === 129 || data.controlCode === 132) {
      updateValveStatus(data.devEui, data.valveStatus === "open")
    }
  });

 
  useEffect(() => {
   (async () => {
      await fetchValves()
    }
   )()
  }, [])

  const toggleValve = (id: string, valveStatus: boolean) => {


    const message = {
      devEui: id,
      valveStatus: valveStatus ? "closed" : "open",
    };

    try {
      sendMessage(message);
      setValves(
        valves.map((valve) =>
          valve.devEui === id ? { ...valve, isLoading: true, startedAt: new Date() } : valve
        )
      );

    } catch (error) {
      console.error("Error al enviar mensaje WebSocket:", error);
    }
  };

  const handleEdit = (valve: IValve) => {
    setCurrentValve(valve)
    setEditSheetOpen(true)
  }

  const handleSaveEdit = (id: string, name: string, location: string, status: boolean) => {
    setValves(valves.map((valve) => (valve.devEui === id ? { ...valve, name, location, status } : valve)))
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
          <TabsTrigger  value="all">Todas las Válvulas</TabsTrigger>
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
        onToggle={toggleValve}
      />
    </div>
  )
}

