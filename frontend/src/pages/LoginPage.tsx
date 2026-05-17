import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginApi } from "../services/api";
import { hashPassword } from "../utils/crypto";
import logo from "../assets/logo.png";
import { MascotAnimation } from "../components/Dotlottie";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ usuario: "", contrasena: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const contrasenaHash = await hashPassword(form.contrasena);
      const data = await loginApi({
        usuario: form.usuario,
        contrasena: contrasenaHash,
      });
      login(data, form.usuario);
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
      <div
        className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="w-full max-w-5xl relative z-10 flex flex-col md:flex-row bg-white rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden min-h-[75vh]">
        {/* Left Side: Form Card */}
        <div className="md:w-1/2 bg-white p-10 sm:p-14 flex flex-col justify-center border-r border-slate-100">
          <img
            src={logo}
            alt="Mascotas del censo"
            className="w-32 h-32 mx-auto mb-6 object-contain"
          />
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2 text-center">
            Iniciar Sesión
          </h1>
          <p className="text-slate-500 text-sm font-medium mb-8 text-center">
            ¡Qué bueno verte de nuevo! Ingresa tus datos.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50/80 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
              <span className="text-red-500"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Usuario
              </label>
              <input
                type="text"
                required
                placeholder="tu_usuario"
                value={form.usuario}
                onChange={(e) =>
                  setForm((f) => ({ ...f, usuario: e.target.value }))
                }
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#75D8F0] focus:border-[#75D8F0] focus:bg-white transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Contraseña
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={form.contrasena}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contrasena: e.target.value }))
                }
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#75D8F0] focus:border-[#75D8F0] focus:bg-white transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#74cfe3] to-[#3ca0d4] hover:from-[#9ae8fb] hover:to-[#2e8cbd] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-full text-sm shadow-[0_8px_20px_-6px_rgba(60,160,212,0.4)] transform hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 mt-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
                  Iniciando...
                </span>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm font-medium text-slate-500">
              ¿Aún no tienes cuenta?{" "}
              <Link
                to="/registro"
                className="text-[#2e8cbd] font-bold hover:underline transition-all"
              >
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-[#e0f7fa] via-[#d7f2f5] to-[#a1e2ea] items-center justify-center overflow-hidden p-10 flex-col">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/40 rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>

          <div className="relative top-2 z-10 w-80 h-80 lg:w-80 lg:h-80 drop-shadow-[0_20px_25px_rgba(11,60,93,0.2)] flex items-center justify-center  mb-8">
            <MascotAnimation />
          </div>

          {/* Spacer mid */}
          <div className="flex-1"></div>

          {/* Caja de texto inferior (Efecto Glassmorphism refinado) */}
          <div className="relative z-10 bg-white/40 p-10 rounded-[2.5rem] border border-white/60 backdrop-blur-xl w-full max-w-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] text-center">
            <h2 className="text-4xl font-black text-[#0b3c5d] mb-4 tracking-tight">
              Censo de Mascotas
            </h2>
            <p className="text-[#1a5a7a] text-lg font-semibold leading-relaxed max-w-lg mx-auto">
              Lleva el control geolocalizado de tus mascotas en tu ciudad de
              manera rápida y segura.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
