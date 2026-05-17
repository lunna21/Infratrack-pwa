import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { IoPersonAdd } from "react-icons/io5";
import { MdPets } from "react-icons/md";
import { FcSurvey } from "react-icons/fc";
import { TbMapHeart } from "react-icons/tb";
import logo from "../assets/logo.png";



export const DashboardPage = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      icon: IoPersonAdd,
      label: "Registrar Persona",
      description: "Gestión de dueños",
      path: "/personas/nueva",
      bg: "bg-emerald-500",
      color: "text-emerald-700",
      bgLight: "bg-emerald-50",
    },
    {
      icon: MdPets,
      label: "Registrar Mascota",
      description: "Nueva mascota",
      path: "/mascotas/nueva",
      bg: "bg-amber-500",
      color: "text-amber-700",
      bgLight: "bg-amber-50",
    },
    {
      icon: FcSurvey,
      label: "Nuevo Censo",
      description: "Registro geolocalizado",
      path: "/censo/nuevo",
      bg: "bg-violet-500",
      color: "text-violet-700",
      bgLight: "bg-violet-50",
    },
    {
      icon: TbMapHeart,
      label: "Ver Mapa",
      description: "Explora los censos",
      path: "/mapa",
      bg: "bg-blue-500",
      color: "text-blue-700",
      bgLight: "bg-blue-50",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Decors */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-slate-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-white/50 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-md cursor-default transform hover:rotate-12 transition-transform">
            <img
              src={logo}
              alt="Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
          <span className="font-extrabold text-slate-800 text-xl tracking-tight hidden sm:block">
            Censo Mascotas
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-medium text-slate-600">
              Hola, <strong className="text-slate-800">{usuario}</strong>
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-bold px-4 py-2 rounded-full transition-colors border border-red-200/50 active:scale-95"
          >
            Salir
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-10 relative z-10 animate-fade-in">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            Panel principal
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">
            ¿Qué te gustaría hacer hoy?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="group bg-white rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 p-6 hover:-translate-y-1.5 transition-all duration-300 text-left relative overflow-hidden h-full flex flex-col justify-between"
            >
              <div
                className={`absolute top-0 right-0 w-24 h-24 ${item.bg} opacity-[0.03] group-hover:opacity-[0.08] rounded-bl-full transition-opacity duration-300`}
              ></div>

              <div>
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${item.bgLight} ${item.color} text-2xl mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <item.icon />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  {item.label}
                </h3>
                <p className="text-sm font-medium text-slate-500">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 flex items-center text-sm font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                Iniciar ahora
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};
