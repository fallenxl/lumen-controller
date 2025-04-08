import { useAuthStore } from "@/store";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
  const { refreshToken} = useAuthStore();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean |null>(null);
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      refreshToken({token}).then((response) => {
        if (response) {
          setIsAuthenticated(true);
          localStorage.setItem("jwt", response.access_token);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem("jwt");
        }
      })
    } else {
      // Si no hay token, redirigir al login
      localStorage.removeItem("jwt");
    }

  }, []);

  if (isAuthenticated === null) {
    // Mostrar un loader o algo mientras se verifica la autenticación
    return <div>Loading...</div>;
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
