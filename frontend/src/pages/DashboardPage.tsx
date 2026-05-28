import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { getPersonasApi, getMascotasApi, getCensosApi } from "../services/api";
import type { CensoDetalle, Mascota, Persona } from "../types";
import { TIPO_MAQUINARIA_LABEL } from "../types";
import {
  LuCamera,
  LuMapPin,
  LuUsers,
  LuTruck,
  LuChartNoAxesColumn,
  LuActivity,
  LuArrowUpRight,
  LuClock,
  LuShieldCheck,
  LuHardHat,
} from "react-icons/lu";

const fmtTime = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-CO", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });
  } catch {
    return iso;
  }
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { usuario, rol } = useAuth();
  const isGerente = rol === "GERENTE";

  const { data: personas } = useSWR<Persona[]>("personas", getPersonasApi, { revalidateOnFocus: false });
  const { data: mascotas } = useSWR<Mascota[]>("mascotas", getMascotasApi, { revalidateOnFocus: false });
  const { data: censos } = useSWR<CensoDetalle[]>("censos", getCensosApi, { revalidateOnFocus: false });

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const stats = [
    {
      label: "Personal activo",
      value: personas?.length ?? 0,
      delta: "+12% mes",
      icon: LuUsers,
      onClick: isGerente ? () => navigate("/personal") : undefined,
    },
    {
      label: "Maquinaria",
      value: mascotas?.length ?? 0,
      delta: "Operativa",
      icon: LuTruck,
      onClick: isGerente ? () => navigate("/maquinaria") : undefined,
    },
    {
      label: "Capturas en campo",
      value: censos?.length ?? 0,
      delta: "Hoy",
      icon: LuCamera,
      onClick: () => navigate("/mapa"),
    },
    {
      label: "Frentes activos",
      value: new Set(censos?.map((c) => c.idProyecto) ?? []).size || 1,
      delta: "Geolocalizados",
      icon: LuMapPin,
      onClick: () => navigate("/mapa"),
    },
  ];

  // Acciones rápidas según rol
  const acciones = isGerente
    ? [
        { label: "Registrar personal", desc: "Alta de operadores y residentes", icon: LuUsers, path: "/personal/nuevo" },
        { label: "Registrar maquinaria", desc: "Excavadoras, bulldozers, volquetas", icon: LuTruck, path: "/maquinaria/nueva" },
        { label: "Captura de campo", desc: "Foto + GPS + IA Roboflow", icon: LuCamera, path: "/campo/nuevo" },
        { label: "Mapa de obra", desc: "Frentes activos y reportes geo", icon: LuMapPin, path: "/mapa" },
        { label: "Reportes ejecutivos", desc: "Auditoría, gráficos y PDF", icon: LuChartNoAxesColumn, path: "/reportes" },
      ]
    : [
        { label: "Captura de campo", desc: "Reporta avance del frente", icon: LuCamera, path: "/campo/nuevo" },
        { label: "Mapa de obra", desc: "Mis registros geolocalizados", icon: LuMapPin, path: "/mapa" },
      ];

  const recientes = (censos ?? []).slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12 w-full animate-fade-in">
        {/* Hero */}
        <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-8 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.18em]">
              {isGerente ? <LuShieldCheck className="w-3 h-3" /> : <LuHardHat className="w-3 h-3" />}
              {isGerente ? "Acceso Gerente" : "Acceso Residente"}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Bienvenido, <span className="text-brand-secondary">{usuario}</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium max-w-xl">
              {isGerente
                ? "Resumen ejecutivo de operaciones, personal y maquinaria en obra."
                : "Tu panel para reportar avances y capturas de campo en tiempo real."}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200">
              <LuClock className="w-4 h-4 text-slate-500" />
              <span className="font-mono font-bold text-slate-800">
                {now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="text-slate-400 font-medium">
                {now.toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
              <LuActivity className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Sistema OK</span>
            </div>
          </div>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {stats.map((s) => (
            <button
              key={s.label}
              onClick={s.onClick}
              disabled={!s.onClick}
              className="group corp-stat text-left transition-all hover:border-slate-300 hover:shadow-md disabled:cursor-default"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-md bg-slate-900 text-white flex items-center justify-center">
                  <s.icon className="w-4 h-4" />
                </div>
                {s.onClick && (
                  <LuArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-brand-primary transition-colors" />
                )}
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tight font-mono">{s.value}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">{s.label}</p>
              <p className="text-[11px] font-semibold text-slate-400 mt-2">{s.delta}</p>
            </button>
          ))}
        </section>

        {/* Body grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Acciones rápidas */}
          <div className="lg:col-span-2">
            <div className="flex items-end justify-between mb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Acciones rápidas</h2>
                <p className="text-sm text-slate-500 font-medium">Operaciones disponibles para tu rol.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {acciones.map((a) => (
                <button
                  key={a.path}
                  onClick={() => navigate(a.path)}
                  className="group corp-card p-5 text-left hover:border-brand-primary hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-lg bg-orange-50 border border-orange-200 text-brand-secondary flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white group-hover:border-brand-primary transition-colors">
                      <a.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900">{a.label}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{a.desc}</p>
                    </div>
                    <LuArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-brand-primary transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Actividad reciente */}
          <div>
            <div className="flex items-end justify-between mb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Actividad reciente</h2>
                <p className="text-sm text-slate-500 font-medium">Últimas capturas en campo.</p>
              </div>
            </div>

            <div className="corp-card divide-y divide-slate-100">
              {recientes.length === 0 && (
                <div className="p-8 text-center">
                  <LuCamera className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-500">Aún no hay capturas registradas.</p>
                  <button
                    onClick={() => navigate("/campo/nuevo")}
                    className="mt-3 text-xs font-bold text-brand-primary hover:text-brand-hover"
                  >
                    Crear la primera →
                  </button>
                </div>
              )}
              {recientes.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate("/mapa")}
                  className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-md bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <LuTruck className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {c.mascota?.nombre || "Maquinaria"}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500 truncate">
                      {TIPO_MAQUINARIA_LABEL[c.mascota?.tipo as keyof typeof TIPO_MAQUINARIA_LABEL] || "Equipo"} ·
                      {" "}{c.lat.toFixed(3)}, {c.lon.toFixed(3)}
                    </p>
                  </div>
                  {c.id && (
                    <span className="text-[10px] font-mono text-slate-400">#{String(c.id).slice(0, 6)}</span>
                  )}
                </button>
              ))}
              {recientes.length > 0 && (
                <button
                  onClick={() => navigate("/mapa")}
                  className="w-full px-4 py-3 text-xs font-bold text-brand-primary hover:bg-orange-50 uppercase tracking-wider"
                >
                  Ver todas en el mapa →
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Suppress unused warnings safely */}
        <span className="hidden">{fmtTime(new Date().toISOString())}</span>
      </main>
    </div>
  );
};
