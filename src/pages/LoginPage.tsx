import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginApi } from "../services/api";
import { hashPassword } from "../utils/crypto";
import logo from "../assets/logo.png";

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

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Logo / Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-24 h-24 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100 border border-white/50 flex items-center justify-center mb-6 transform hover:scale-105 transition-transform duration-300">
            <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Bienvenido de nuevo
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-100/50 border border-white/60 p-8 sm:p-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50/80 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
              <span className="text-red-500">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Usuario
              </label>
              <input
                type="text"
                required
                placeholder="Ej. tu_usuario123"
                value={form.usuario}
                onChange={(e) =>
                  setForm((f) => ({ ...f, usuario: e.target.value }))
                }
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white transition-all duration-200"
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
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-indigo-600/30 transform hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Iniciando sesión...
                </span>
              ) : (
                "Ingresar a mi cuenta"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-slate-500">
              ¿Aún no tienes cuenta?{" "}
              <Link
                to="/registro"
                className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
              >
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
