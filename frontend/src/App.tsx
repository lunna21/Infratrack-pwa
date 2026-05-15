import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegistroPage } from './pages/RegistroPage';
import { DashboardPage } from './pages/DashboardPage';
import { PersonaNuevaPage } from './pages/PersonaNuevaPage';
import { MascotaNuevaPage } from './pages/MascotaNuevaPage';
import { CensoNuevoPage } from './pages/CensoNuevoPage';

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
          <Route
            path="/personas/nueva"
            element={
              <ProtectedRoute>
                <PersonaNuevaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mascotas/nueva"
            element={
              <ProtectedRoute>
                <MascotaNuevaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/censo/nuevo"
            element={
              <ProtectedRoute>
                <CensoNuevoPage />
              </ProtectedRoute>
            }
          />
          {/* Próximas rutas (las iremos agregando) */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;