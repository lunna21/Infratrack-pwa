import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';
import type { Rol } from '../types';

interface Props {
  children: ReactNode;
  /** Si se especifica, sólo estos roles pueden ver la ruta. */
  roles?: Rol[];
}

export const ProtectedRoute = ({ children, roles }: Props) => {
  const { isAuthenticated, rol } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && rol && !roles.includes(rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
