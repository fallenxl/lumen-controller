import { LoginForm } from "@/components/login-form";

export function Login(){
    return (
        <main className="min-h-screen bg-white md:bg-neutral-100 flex items-center justify-center">
            <LoginForm />
        </main>
    );
}