import { useNavigate } from "react-router-dom";
import { IoPersonAdd, IoPeople } from "react-icons/io5";
import { MdPets } from "react-icons/md";
import { MdAssignmentAdd } from "react-icons/md";
import { TbMapHeart, TbListSearch } from "react-icons/tb";
import { Navbar } from "../components/Navbar";
import { CatAnimation } from "../components/CatAnimation";

export const DashboardPage = () => {
  const navigate = useNavigate();

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
      icon: IoPeople,
      label: "Ver Personas",
      description: "Lista y filtros",
      path: "/personas",
      bg: "bg-teal-500",
      color: "text-teal-700",
      bgLight: "bg-teal-50",
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
      icon: TbListSearch,
      label: "Ver Mascotas",
      description: "Lista y filtros",
      path: "/mascotas",
      bg: "bg-orange-500",
      color: "text-orange-700",
      bgLight: "bg-orange-50",
    },
    {
      icon: MdAssignmentAdd,
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
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
      {/* Decors */}
      <div className="absolute top-[-15%] left-[-10%] w-125 h-125 bg-slate-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>

      <Navbar />

      {/* Content */}
      <main className="max-w-5xl pt-26 mx-auto px-6 py-10 relative z-15 animate-fade-in flex-1 w-full">
        <div className="relative  mt-6">
          <div className="flex flex-col md:flex-row items-center md:items-center ">
            <div className="text-center md:text-left z-10">
              <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">
                Panel <span className="text-brand-secondary">principal</span>
              </h1>
              <p className="text-slate-500 mt-3 font-medium text-lg md:text-xl max-w-md">
                ¡Bienvenido! ¿Qué tarea tenemos para hoy?
              </p>
              <div className="h-1.5 w-20 bg-brand-secondary rounded-full mt-4 mx-auto md:mx-0 opacity-20" />
            </div>

            <div className="relative z-0 group md:-mt-12">
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-900/10 blur-xl rounded-full" />
              <CatAnimation className="w-96 h-64 md:w-64 md:h-64 drop-shadow-xl" />
            </div>
          </div>
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

              <div className="mt-6 flex items-center text-sm font-bold text-brand-primary opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
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
