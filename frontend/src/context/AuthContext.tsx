import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthContextType, LoginResponse, Rol } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

const isRol = (value: string | null): value is Rol =>
  value === 'GERENTE' || value === 'RESIDENTE';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jwt_token'));
  const [usuario, setUsuario] = useState<string | null>(() => localStorage.getItem('jwt_usuario'));
  const [rol, setRol] = useState<Rol | null>(() => {
    const stored = localStorage.getItem('jwt_rol');
    return isRol(stored) ? stored : null;
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    const storedUsuario = localStorage.getItem('jwt_usuario');
    const storedRol = localStorage.getItem('jwt_rol');
    const expiry = localStorage.getItem('jwt_expiry');

    if (storedToken && storedUsuario && expiry) {
      const expiryMs = parseInt(expiry, 10);
      if (Date.now() < expiryMs) {
        setToken(storedToken);
        setUsuario(storedUsuario);
        if (isRol(storedRol)) setRol(storedRol);
      } else {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('jwt_usuario');
        localStorage.removeItem('jwt_rol');
        localStorage.removeItem('jwt_expiry');
      }
    }
  }, []);

  const login = (data: LoginResponse, usuarioNombre: string, rolUsuario: Rol) => {
    const expiryMs = Date.now() + data.expiraEn * 1000;
    localStorage.setItem('jwt_token', data.token);
    localStorage.setItem('jwt_usuario', usuarioNombre);
    localStorage.setItem('jwt_rol', rolUsuario);
    localStorage.setItem('jwt_expiry', String(expiryMs));
    setToken(data.token);
    setUsuario(usuarioNombre);
    setRol(rolUsuario);
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('jwt_usuario');
    localStorage.removeItem('jwt_rol');
    localStorage.removeItem('jwt_expiry');
    setToken(null);
    setUsuario(null);
    setRol(null);
  };

  return (
    <AuthContext.Provider value={{ token, usuario, rol, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
