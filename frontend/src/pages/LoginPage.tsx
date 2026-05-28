import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginApi } from "../services/api";
import { hashPassword } from "../utils/crypto";
import logo from "../assets/logo.png";
import { Button } from "../components/Button";
import type { Rol } from "../types";
import { LuShieldCheck, LuHardHat, LuMapPin, LuActivity } from "react-icons/lu";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ usuario: "", contrasena: "" });
  const [rol, setRol] = useState<Rol>("RESIDENTE");
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
      login(data, form.usuario, rol);
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Formulario */}
        <div className="md:w-1/2 bg-white p-8 sm:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-2.5 mb-10">
            <img src={logo || "/placeholder.svg"} alt="Infratrack" className="w-11 h-11 object-contain" />
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-slate-900 text-xl tracking-tight">Infratrack</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Construction Operations</span>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Acceso a la plataforma
          </h1>
          <p className="text-slate-500 text-sm font-medium mb-8">
            Ingresa tus credenciales corporativas para continuar.
          </p>

          {error && (
            <div className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Usuario
              </label>
              <input
                type="text"
                required
                placeholder="usuario.corporativo"
                value={form.usuario}
                onChange={(e) => setForm((f) => ({ ...f, usuario: e.target.value }))}
                className="login-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Contraseña
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={form.contrasena}
                onChange={(e) => setForm((f) => ({ ...f, contrasena: e.target.value }))}
                className="login-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Rol de acceso
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["RESIDENTE", "GERENTE"] as Rol[]).map((r) => {
                  const active = rol === r;
                  const Icon = r === "GERENTE" ? LuShieldCheck : LuHardHat;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRol(r)}
                      className={`flex items-center gap-2 px-3 py-3 rounded-lg border text-sm font-bold transition-all ${
                        active
                          ? "border-brand-primary bg-orange-50 text-brand-secondary"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {r === "GERENTE" ? "Gerente" : "Residente"}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                El rol define las vistas y permisos disponibles.
              </p>
            </div>

            <Button variant="primary" fullWidth isLoading={loading}>
              Ingresar a Infratrack
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm font-medium text-slate-500">
              ¿No tienes cuenta?{" "}
              <Link to="/registro" className="login-link">
                Solicitar acceso
              </Link>
            </p>
          </div>
        </div>

        {/* Banner corporativo */}
        <div className="login-banner">
          <div className="absolute inset-0 bg-grid-dark opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800" />

          <div className="relative z-10 max-w-md text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">Plataforma activa</span>
            </div>

            <h2 className="text-4xl font-black leading-[1.05] tracking-tight mb-5">
              Control total de tus <span className="text-brand-primary">frentes de obra</span>.
            </h2>
            <p className="text-slate-300 text-base leading-relaxed mb-10">
              Captura geolocalizada, detección de maquinaria con IA y reportes
              ejecutivos en una sola plataforma.
            </p>

            <div className="space-y-3">
              {[
                { icon: LuMapPin, title: "Geolocalización", desc: "GPS + timestamp en cada captura." },
                { icon: LuActivity, title: "IA de detección", desc: "Reconocimiento de maquinaria con Roboflow." },
                { icon: LuShieldCheck, title: "Roles seguros", desc: "Vistas separadas para gerente y residente." },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3 p-3.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="w-9 h-9 rounded-md bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center shrink-0">
                    <f.icon className="w-4 h-4 text-brand-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">{f.title}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
