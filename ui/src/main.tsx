import { createRoot } from 'react-dom/client';
import './index.css';
import { SidebarInset, SidebarProvider } from './components/ui/sidebar.tsx';
import { AppSidebar } from './components/app-sidebar.tsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import ProtectedRoute from './guards/auth.guard.tsx';
import App from './pages/App.tsx';
import { Login } from './pages/Login.tsx';

createRoot(document.getElementById('root')!).render(
  <Router>
    <Routes>
      {/* Ruta pública de login */}
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-gradient-to-b from-sky-50 to-white">
              <App />
            </SidebarInset>
          </SidebarProvider>
        } />
        {/* Agrega más rutas protegidas aquí */}
      </Route>
    </Routes>
  </Router>,
);
