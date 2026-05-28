import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCensosApi } from "../services/api";
import type { CensoDetalle, TipoMaquinaria } from "../types";
import { TIPO_MAQUINARIA_LABEL } from "../types";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/Button";
import { LuMapPin, LuRefreshCw, LuLayers } from "react-icons/lu";

const ICON_COLORS: Record<TipoMaquinaria, string> = {
  PERRO: "#F97316",
  GATO: "#0EA5E9",
  PAJARO: "#FACC15",
  OTRO: "#64748B",
};

const buildIcon = (color: string) =>
  L.divIcon({
    className: "infratrack-pin",
    html: `<div style="background:${color}" class="w-7 h-7 rounded-full border-[3px] border-white shadow-lg flex items-center justify-center"><div class="w-2 h-2 rounded-full bg-white"></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

export const MapaPage = () => {
  const [registros, setRegistros] = useState<CensoDetalle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"TODOS" | TipoMaquinaria>("TODOS");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCensosApi();
      setRegistros(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar registros");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(
    () =>
      registros.filter((r) =>
        filtroTipo === "TODOS" ? true : r.mascota.tipo === filtroTipo,
      ),
    [registros, filtroTipo],
  );

  const center = useMemo<[number, number]>(() => {
    if (filtered.length === 0) return [4.711, -74.0721];
    const sumLat = filtered.reduce((s, r) => s + r.lat, 0);
    const sumLon = filtered.reduce((s, r) => s + r.lon, 0);
    return [sumLat / filtered.length, sumLon / filtered.length];
  }, [filtered]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { PERRO: 0, GATO: 0, PAJARO: 0, OTRO: 0 };
    registros.forEach((r) => {
      c[r.mascota.tipo] = (c[r.mascota.tipo] ?? 0) + 1;
    });
    return c;
  }, [registros]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 px-4 sm:px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-primary mb-2">
                <LuMapPin className="w-3.5 h-3.5" />
                Mapa operativo
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Frentes de obra activos
              </h1>
              <p className="text-slate-500 font-medium mt-1.5 max-w-2xl">
                Visualización geolocalizada de los registros de campo capturados por residentes.
              </p>
            </div>
            <Button variant="outline" onClick={load} disabled={loading}>
              <LuRefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Actualizando..." : "Actualizar"}
            </Button>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <aside className="lg:col-span-1 space-y-4">
              <div className="corp-card p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  <LuLayers className="w-3.5 h-3.5" />
                  Filtros
                </div>
                <div className="space-y-1.5">
                  {(["TODOS", "PERRO", "GATO", "PAJARO", "OTRO"] as const).map((tipo) => {
                    const isActive = filtroTipo === tipo;
                    const label =
                      tipo === "TODOS" ? "Todos los equipos" : TIPO_MAQUINARIA_LABEL[tipo];
                    const count = tipo === "TODOS" ? registros.length : counts[tipo] ?? 0;
                    const color = tipo === "TODOS" ? "#0F172A" : ICON_COLORS[tipo];
                    return (
                      <button
                        key={tipo}
                        onClick={() => setFiltroTipo(tipo)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                          isActive
                            ? "bg-slate-900 text-white"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: color }}
                          />
                          {label}
                        </span>
                        <span
                          className={`text-xs font-bold ${isActive ? "text-white/80" : "text-slate-400"}`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="corp-card p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Resumen
                </div>
                <div className="text-3xl font-extrabold text-slate-900">{filtered.length}</div>
                <div className="text-xs font-semibold text-slate-500 mt-1">
                  {filtered.length === 1 ? "registro visible" : "registros visibles"}
                </div>
              </div>
            </aside>

            <div className="lg:col-span-3 corp-card overflow-hidden">
              <div className="h-[640px] relative">
                <MapContainer
                  center={center}
                  zoom={filtered.length > 0 ? 12 : 6}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  {filtered.map((r) => (
                    <Marker
                      key={r.id}
                      position={[r.lat, r.lon]}
                      icon={buildIcon(ICON_COLORS[r.mascota.tipo as TipoMaquinaria] ?? "#64748B")}
                    >
                      <Popup>
                        <div className="font-sans">
                          <div className="font-extrabold text-slate-900">{r.mascota.nombre}</div>
                          <div className="text-xs font-bold uppercase tracking-wider text-brand-primary mt-0.5">
                            {TIPO_MAQUINARIA_LABEL[r.mascota.tipo as TipoMaquinaria]}
                          </div>
                          <div className="text-xs text-slate-600 mt-2">
                            <strong>Residente:</strong> {r.dueno.nombres} {r.dueno.apellidos}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 mt-1">
                            {r.lat.toFixed(5)}, {r.lon.toFixed(5)}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
