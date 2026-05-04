import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthContextType, LoginResponse } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    const storedUsuario = localStorage.getItem('jwt_usuario');
    const expiry = localStorage.getItem('jwt_expiry');

    if (storedToken && storedUsuario && expiry) {
      const expiryMs = parseInt(expiry, 10);
      if (Date.now() < expiryMs) {
        setToken(storedToken);
        setUsuario(storedUsuario);
      } else {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('jwt_usuario');
        localStorage.removeItem('jwt_expiry');
      }
    }
  }, []);

  const login = (data: LoginResponse, usuarioNombre: string) => {
    const expiryMs = Date.now() + data.expiraEn * 1000;
    localStorage.setItem('jwt_token', data.token);
    localStorage.setItem('jwt_usuario', usuarioNombre);
    localStorage.setItem('jwt_expiry', String(expiryMs));
    setToken(data.token);
    setUsuario(usuarioNombre);
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('jwt_usuario');
    localStorage.removeItem('jwt_expiry');
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ token, usuario, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};