"use client"

import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import axios from "axios"
import { LockIcon, LockOpen, Trash } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"
import { ScrollArea } from "./ui/scroll-area"

interface Valve {
  name: string
  status: boolean
  location: string
  devEui: string
  applicationId: string
  isLoading?: boolean
}

interface EditValveSheetProps {
  valve: Valve | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (id: string, name: string, location: string, status: boolean) => void
  onDelete: (id: string) => void
  onToggle: (id: string, status: boolean) => void
}

export function EditValveSheet({ valve, open, onOpenChange, onSave, onDelete, onToggle }: EditValveSheetProps) {
  const [name, setName] = useState(valve?.name || "")
  const [location, setLocation] = useState(valve?.location || "")

  // Update state when valve changes
  useEffect(() => {
    if (valve) {
      setName(valve.name)
      setLocation(valve.location)
    }
  }, [valve])

  const handleSave = async () => {
    if (valve) {
      const response = await axios.patch(`http://${window.location.hostname}:5000/devices`, {
        name: name,
        location: location,
        valveStatus: valve.status ? "open" : "closed",
        devEui: valve.devEui,
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      })

      if (response.status === 200) {
        onSave(valve.devEui, name, location, valve.status)
        onOpenChange(false)
      }


    }
  }

  const handleDelete = async () => {
    if (valve) {
      const response = await axios.delete(`http://${window.location.hostname}:5000/devices`, {
        data: {
          devEui: valve.devEui,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      }
    )

      if (response.status === 200) {
        onOpenChange(false)
        onDelete(valve.devEui)
      }
    }
  }


  return (
    <Sheet open={open} onOpenChange={onOpenChange}  >
      <SheetContent className="px-7 ">
        <ScrollArea className="h-full w-full ">
          <SheetHeader>
            <SheetTitle className="">Editar Válvula</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)}  />
            </div>
            <div className="space-y-2">
              <Label htmlFor="devEui">Device EUI</Label>
              <Input id="devEui" value={valve?.devEui || ""} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Identificador único del dispositivo</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="applicationId">ID de Aplicación</Label>
              <Input id="applicationId" value={valve?.applicationId || ""} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                Identificador de la aplicación que gestiona este dispositivo
              </p>
            </div>
            {/* cambiar estado de la valvula manualmente */}
            <div className="space-y-2">
              <Label htmlFor="status">Comandos</Label>
              <div className="flex items-center gap-2">
                <Button
                variant={'outline'}
                  onClick={() => {
                    if (valve) {
                      onToggle(valve.devEui, false)
                    }
                  }}
                  disabled={valve?.isLoading}
                >
                  <LockOpen className="h-4 w-4" />
                  Abrir
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (valve) {
                      onToggle(valve.devEui, true)
                    }
                  }}
                  disabled={valve?.isLoading}
                >
                  <LockIcon className="h-4 w-4" />
                  Cerrar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Envía un comando para abrir o cerrar la válvula de manera manual
              </p>
            </div>


          </div>
          <SheetFooter className="pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" >
                  <Trash className="h-4 w-4 mr-2" />
                  Eliminar Válvula
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estas seguro que deseas eliminar?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Todos los datos asociados a esta válvula serán eliminados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Guardar Cambios</Button>

          </SheetFooter>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

