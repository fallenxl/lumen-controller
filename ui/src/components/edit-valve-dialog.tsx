import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface Valve {
  id: number
  name: string
  status: boolean
  location: string
  zone: string
}

interface EditValveDialogProps {
  valve: Valve | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (id: number, name: string, location: string) => void
}

export function EditValveDialog({ valve, open, onOpenChange, onSave }: EditValveDialogProps) {
  const [name, setName] = useState(valve?.name || "")
  const [location, setLocation] = useState(valve?.location || "")

  // Update state when valve changes
  useState(() => {
    if (valve) {
      setName(valve.name)
      setLocation(valve.location)
    }
  })

  const handleSave = () => {
    if (valve) {
      onSave(valve.id, name, location)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Válvula</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nombre
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Ubicación
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

