import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "./Button";
import logo from "../assets/logo.png";

export const Navbar = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-white/50 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl transform hover:rotate-12 transition-transform">
          <img src={logo} alt="Logo" className="w-14 object-contain" />
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
        <Button
          variant="primary"
          className="py-2.5 px-6"
          onClick={handleLogout}
        >
          Salir
        </Button>
      </div>
    </nav>
  );
};
