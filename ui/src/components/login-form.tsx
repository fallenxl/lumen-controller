import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store"
import { useState } from "react"
import { useNavigate } from "react-router"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [credentials, setCredentials] = useState({
    username: "admin",
    password: "",
  })
  const { login } = useAuthStore((state) => state)

  const navigate = useNavigate()
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const response = await login({
      username: credentials.username,
      password: credentials.password,
    })
    if (response) {
      localStorage.setItem("jwt", response.access_token)
      navigate("/", { replace: true })
    } else {
      // Handle failed login
      alert("Login failed")
    }
  }
  return (
    <div className={cn("flex flex-col gap-6  ", className)} {...props}>
      <Card className="border-0 bg-white shadow-none md:shadow-md md:border w-full max-w-screen-sm">
        <CardHeader  >
          <div className="flex flex-col items-center justify-center mb-4">
            <img src="/lumen.png" alt="Logo" className="w-48 mb-5" />

            <CardTitle className="text-2xl">Bienvenido</CardTitle>
            <CardDescription className="mt-2">
              Inicie sesión para acceder al sistema de control de válvulas.
            </CardDescription>
          </div>

        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  id="username"
                  type="text"
                  value={credentials.username}
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                </div>
                <Input
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  value={credentials.password}
                  id="password" type="password" placeholder="****************" required />
              </div>
            </div>
            <Button type="submit" className="w-full mt-6">
              Iniciar sesión
            </Button>
      
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
