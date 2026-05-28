import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegistroPage } from './pages/RegistroPage';
import { DashboardPage } from './pages/DashboardPage';
import { PersonaNuevaPage } from './pages/PersonaNuevaPage';
import { MascotaNuevaPage } from './pages/MascotaNuevaPage';
import { CensoNuevoPage } from './pages/CensoNuevoPage';
import { MascotasPage } from './pages/MascotasPage';
import { PersonasPage } from './pages/PersonasPage';
import { MapaPage } from './pages/MapaPage';
import { ReportesPage } from './pages/ReportesPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Personal — sólo Gerente */}
          <Route
            path="/personal/nuevo"
            element={
              <ProtectedRoute roles={["GERENTE"]}>
                <PersonaNuevaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/personal"
            element={
              <ProtectedRoute roles={["GERENTE"]}>
                <PersonasPage />
              </ProtectedRoute>
            }
          />

          {/* Maquinaria — sólo Gerente */}
          <Route
            path="/maquinaria/nueva"
            element={
              <ProtectedRoute roles={["GERENTE"]}>
                <MascotaNuevaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maquinaria"
            element={
              <ProtectedRoute roles={["GERENTE"]}>
                <MascotasPage />
              </ProtectedRoute>
            }
          />

          {/* Captura de campo — todos los roles */}
          <Route
            path="/campo/nuevo"
            element={
              <ProtectedRoute>
                <CensoNuevoPage />
              </ProtectedRoute>
            }
          />

          {/* Mapa */}
          <Route
            path="/mapa"
            element={
              <ProtectedRoute>
                <MapaPage />
              </ProtectedRoute>
            }
          />

          {/* Reportes — sólo Gerente */}
          <Route
            path="/reportes"
            element={
              <ProtectedRoute roles={["GERENTE"]}>
                <ReportesPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
