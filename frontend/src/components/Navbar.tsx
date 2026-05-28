import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { LuLayoutDashboard, LuMapPin, LuCamera, LuUsers, LuTruck, LuChartNoAxesColumn, LuLogOut, LuMenu, LuX } from "react-icons/lu";
import { useState } from "react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: ("GERENTE" | "RESIDENTE")[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LuLayoutDashboard },
  { label: "Captura de campo", path: "/campo/nuevo", icon: LuCamera },
  { label: "Mapa de obra", path: "/mapa", icon: LuMapPin },
  { label: "Personal", path: "/personal", icon: LuUsers, roles: ["GERENTE"] },
  { label: "Maquinaria", path: "/maquinaria", icon: LuTruck, roles: ["GERENTE"] },
  { label: "Reportes", path: "/reportes", icon: LuChartNoAxesColumn, roles: ["GERENTE"] },
];

export const Navbar = ({ className }: { className?: string }) => {
  const { usuario, rol, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (rol && item.roles.includes(rol)),
  );

  return (
    <nav
      className={`bg-white border-b border-slate-200 w-full fixed top-0 left-0 z-50 ${className ?? ""}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <img src={logo || "/placeholder.svg"} alt="Infratrack" className="w-9 h-9 object-contain" />
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">Infratrack</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Construction Ops</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {visibleItems.map((item) => {
              const active = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-slate-100 border border-slate-200">
            <span className={`w-2 h-2 rounded-full ${rol === "GERENTE" ? "bg-brand-primary" : "bg-emerald-500"}`} />
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-bold text-slate-900">{usuario}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {rol === "GERENTE" ? "Gerente" : "Residente"}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <LuLogOut className="w-4 h-4" />
            Salir
          </button>
        </div>

        <button
          className="lg:hidden p-2 rounded-md text-slate-700 hover:bg-slate-100"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          {mobileOpen ? <LuX className="w-6 h-6" /> : <LuMenu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-3 flex items-center justify-between bg-slate-50">
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold text-slate-900">{usuario}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {rol === "GERENTE" ? "Gerente" : "Residente"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-700 bg-white border border-slate-200"
            >
              <LuLogOut className="w-3.5 h-3.5" />
              Salir
            </button>
          </div>
          <div className="py-2">
            {visibleItems.map((item) => {
              const active = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold ${
                    active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};
