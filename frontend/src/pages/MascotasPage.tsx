import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Mascota, TipoMaquinaria } from "../types";
import { TIPO_MAQUINARIA_LABEL } from "../types";
import { getMascotasApi } from "../services/api";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/Button";
import { FormInput } from "../components/FormInput";
import { FormSelect } from "../components/FormSelect";
import { LuTruck, LuPlus, LuRefreshCw, LuActivity } from "react-icons/lu";

const TIPOS: { value: string; label: string }[] = [
  { value: "TODOS", label: "Todos los equipos" },
  { value: "PERRO", label: TIPO_MAQUINARIA_LABEL.PERRO },
  { value: "GATO", label: TIPO_MAQUINARIA_LABEL.GATO },
  { value: "PAJARO", label: TIPO_MAQUINARIA_LABEL.PAJARO },
  { value: "OTRO", label: TIPO_MAQUINARIA_LABEL.OTRO },
];

const ESTADO_LABEL: Record<string, { label: string; className: string }> = {
  MACHO: { label: "Operativa", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  HEMBRA: { label: "Mantenimiento", className: "bg-amber-50 text-amber-700 border-amber-200" },
};

export const MascotasPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState("TODOS");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMascotasApi();
      setItems(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar maquinaria");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((m) => {
      const matchesQ = !q || m.nombre.toLowerCase().includes(q);
      const matchesT = tipo === "TODOS" || m.tipo === tipo;
      return matchesQ && matchesT;
    });
  }, [items, search, tipo]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 px-4 sm:px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-primary mb-2">
                <LuTruck className="w-3.5 h-3.5" />
                Inventario de maquinaria
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Flota de equipos pesados
              </h1>
              <p className="text-slate-500 font-medium mt-1.5 max-w-2xl">
                Excavadoras, bulldozers y volquetas asignados a los frentes de obra. Estado, antigüedad y trazabilidad.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={load} disabled={loading}>
                <LuRefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Actualizando..." : "Actualizar"}
              </Button>
              <Button variant="primary" onClick={() => navigate("/maquinaria/nueva")}>
                <LuPlus className="w-4 h-4 mr-2" />
                Registrar equipo
              </Button>
            </div>
          </div>

          <div className="corp-card p-5 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Buscar"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre o placa del equipo"
              />
              <FormSelect
                label="Tipo de equipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                options={TIPOS}
              />
              <div className="flex items-end">
                <div className="w-full px-4 py-3 rounded-lg bg-slate-100 border border-slate-200 text-sm font-bold text-slate-700">
                  {filtered.length} equipo{filtered.length === 1 ? "" : "s"}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="corp-card p-12 text-center text-slate-500 font-semibold">
              Cargando flota...
            </div>
          ) : filtered.length === 0 ? (
            <div className="corp-card p-12 text-center">
              <LuTruck className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600 font-bold">Sin equipos</p>
              <p className="text-slate-400 text-sm font-medium mt-1">
                Registra el primer equipo de la flota para comenzar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((m) => {
                const tipoLabel = TIPO_MAQUINARIA_LABEL[m.tipo as TipoMaquinaria] ?? m.tipo;
                const estado = ESTADO_LABEL[m.genero] ?? { label: m.genero, className: "bg-slate-100 text-slate-700 border-slate-200" };
                return (
                  <div key={m.id} className="corp-card overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-slate-900 relative overflow-hidden">
                      {m.fotografia ? (
                        <img
                          src={m.fotografia || "/placeholder.svg"}
                          alt={m.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-grid-dark flex items-center justify-center">
                          <LuTruck className="w-12 h-12 text-slate-600" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-sm border border-white/10">
                          {tipoLabel}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                          {m.nombre}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${estado.className}`}>
                          {estado.label}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <LuActivity className="w-3.5 h-3.5" />
                          {m.edad} año{m.edad === 1 ? "" : "s"} de servicio
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
