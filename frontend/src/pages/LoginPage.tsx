import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginApi } from "../services/api";
import { hashPassword } from "../utils/crypto";
import logo from "../assets/logo.png";
import { MascotAnimation } from "../components/Dotlottie";
import {Button } from "../components/Button";

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
    <div className="login-wrapper">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
      <div
        className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="login-card">
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
                className="login-input"
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
                className="login-input"
              />
            </div>

            <Button variant="primary" fullWidth isLoading={loading}>Ingresar</Button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm font-medium text-slate-500">
              ¿Aún no tienes cuenta?{" "}
              <Link to="/registro" className="login-link">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>

        <div className="login-banner">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/40 rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>

          <div className="mascot-container">
            <MascotAnimation />
          </div>

          {/* Spacer mid */}
          <div className="flex-1"></div>

          {/* Caja de texto inferior (Efecto Glassmorphism refinado) */}
          <div className="glass-panel">
            <h2 className="text-4xl font-black text-brand-dark mb-4 tracking-tight">
              Censo de Mascotas
            </h2>
            <p className="text-brand-dark-muted text-lg font-semibold leading-relaxed max-w-lg mx-auto">
              Lleva el control geolocalizado de tus mascotas en tu ciudad de
              manera rápida y segura.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
