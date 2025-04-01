import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { DropletIcon, MapPinIcon, EditIcon, Loader2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Valve {
  name: string
  status: boolean
  location: string
  devEui: string
  applicationId: string
  lastUpdate?: string
  batteryLevel?: number
  totalConsumption: number
  isLoading?: boolean
}

interface ValveControlCardProps {
  valve: Valve
  onToggle: () => void
  onEdit: () => void
}

export default function ValveControlCard({ valve, onToggle, onEdit }: ValveControlCardProps) {
  return (
    <Card
      className={`transition-all duration-300 ${valve.status ? "border-sky-500 shadow-sky-100 shadow-md" : "border-gray-200"}`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
           
            <CardTitle className="text-lg font-medium">{valve.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
        
          {valve.batteryLevel && (
              <Badge variant="default" className="bg-neutral-100 text-neutral-600 text-xs">
                {parseInt(valve.batteryLevel.toString())}%
              </Badge>
            )}
              <Badge
            variant="default"
            className={`text-xs ${new Date().getTime() - new Date(valve.lastUpdate || '').getTime() > 86400000 ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}
          >
            {new Date().getTime() - new Date(valve.lastUpdate || '').getTime() > 86400000 ? "Offline" : "Online"}
          </Badge>
            <Badge
              variant={valve.status ? "default" : "outline"}
              className={valve.status ? "bg-sky-500 hover:bg-sky-600" : ""}
            >
              {valve.status ? "ON" : "OFF"}
            </Badge>

          </div>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPinIcon className="h-3 w-3 mr-1" />
          {valve.location}
        </div>

      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-4 gap-2">
          <div
            className={`relative w-24 h-24 rounded-full flex items-center justify-center ${valve.status ? "bg-sky-100" : "bg-gray-100"}`}
          >
            <DropletIcon className={`h-12 w-12 ${valve.status ? "text-sky-500" : "text-gray-400"}`} />
            {valve.status && <div className="absolute inset-0 rounded-full animate-ping bg-sky-400 opacity-20"></div>}

          </div>

          {valve.isLoading && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
              <span className="text-xs text-neutral-600">Esperando respuesta...</span>
            </div>
          )}
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-medium">{valve.totalConsumption.toFixed(2)} <span className="text-sm">m³</span></span>
            <span className="text-xs text-muted-foreground">Consumo total</span>
          </div>

        </div>
      </CardContent>
      <CardFooter className="flex  flex-col items-start pt-0 gap-5">
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit} className="flex items-center gap-1">
              <EditIcon className="h-3 w-3" />
              <span>Editar</span>
            </Button>

          </div>
          <div className="flex items-center gap-2">

            <div className="relative">
              <Switch
                disabled={valve.isLoading}

                checked={valve.status} onCheckedChange={onToggle} className={cn("data-[state=checked]:bg-sky-500", valve.isLoading && "opacity-70 pointer-events-none")} />
              {valve.isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute w-[110%] h-full bg-background/50 rounded-full" />
                  <Loader2 className="h-3 w-3 animate-spin text-sky-500 z-10" />
                </div>
              )}
            </div>

          </div>
        </div>
        <div className="flex justify-start items-center text-xs text-neutral-400 ">
          <Clock className="h-3 w-3 mr-1" />
          Ult. actualización: {valve.lastUpdate ? new Date(valve.lastUpdate).toLocaleString() : "Nunca"}
        </div>
      </CardFooter>

    </Card>
  )
}

