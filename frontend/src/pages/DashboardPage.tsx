import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: '👤', label: 'Registrar Persona', path: '/personas/nueva', color: 'bg-green-100 text-green-700' },
    { icon: '🐾', label: 'Registrar Mascota', path: '/mascotas/nueva', color: 'bg-orange-100 text-orange-700' },
    { icon: '📋', label: 'Nuevo Censo', path: '/censo/nuevo', color: 'bg-purple-100 text-purple-700' },
    { icon: '🗺️', label: 'Ver Mapa', path: '/mapa', color: 'bg-blue-100 text-blue-700' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <span className="font-bold text-gray-900 text-lg">Censo Mascotas</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:block">Hola, <strong>{usuario}</strong></span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Panel principal</h1>
        <p className="text-gray-500 mb-8">Selecciona una opción para comenzar</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {menuItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${item.color} text-2xl mb-3`}>
                {item.icon}
              </div>
              <p className="text-sm font-semibold text-gray-800">{item.label}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};