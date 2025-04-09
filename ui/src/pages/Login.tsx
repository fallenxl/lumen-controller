import { LoginForm } from "@/components/login-form";

export function Login(){
    return (
        <main className="min-h-screen bg-white md:bg-neutral-100 flex flex-col items-center justify-center">
          
            <LoginForm  className="w-full md:max-w-sm"/>
            <div className="text-sm text-gray-500 mt-4 max-w-sm text-center px-2">
                Al hacer clic en "Iniciar sesión", aceptas nuestros <a href="#" className="text-blue-500">Términos de servicio</a> y <a href="#" className="text-blue-500">Política de privacidad</a>.
            </div>
        </main>
    );
}