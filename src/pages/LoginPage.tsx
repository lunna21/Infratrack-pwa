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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-56 h-56 bg-white-600 rounded-2xl mb-4 ">
            <img src={logo} alt="Logo" className="w-56 h-56 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Censo Mascotas</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Inicia sesión para continuar
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors duration-200"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              ¿No tienes cuenta?{" "}
              <Link
                to="/registro"
                className="text-blue-600 font-medium hover:underline"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
