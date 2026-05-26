import { useEffect, useMemo, useState } from "react";
import { Navbar } from "../components/Navbar";
import { AnimalFootPrint } from "../components/AnimalFootPrint";
import { Button } from "../components/Button";
import { FormInput } from "../components/FormInput";
import { LeafletCensoMap } from "../components/LeafletCensoMap";
import { getCensosApi } from "../services/api";
import type { CensoDetalle } from "../types";

type LocationPoint = {
  lat: number;
  lng: number;
};

export const MapaPage = () => {
  const [censos, setCensos] = useState<CensoDetalle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCensoId, setSelectedCensoId] = useState<string | null>(null);
  const [focusLocation, setFocusLocation] = useState<LocationPoint | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const loadCensos = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getCensosApi();
      setCensos(data);
      setSelectedCensoId((current) => current ?? data[0]?.id ?? null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar censos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;

    void getCensosApi()
      .then((data) => {
        if (!alive) return;
        setCensos(data);
        setSelectedCensoId((current) => current ?? data[0]?.id ?? null);
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Error al cargar censos");
      })
      .finally(() => {
        if (alive) {
          setLoading(false);
        }
      });

    return () => {
      alive = false;
    };
  }, []);

  const filteredCensos = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return censos;

    return censos.filter((censo) => {
      const mascota = censo.mascota.nombre.toLowerCase();
      const dueno = `${censo.dueno.nombres} ${censo.dueno.apellidos}`
        .trim()
        .toLowerCase();
      const proyecto = censo.idProyecto.toLowerCase();
      return (
        mascota.includes(query) || dueno.includes(query) || proyecto.includes(query)
      );
    });
  }, [censos, search]);

  const selectedCenso =
    filteredCensos.find((censo) => censo.id === selectedCensoId) ?? null;

  const handleLocateMe = () => {
    if (!("geolocation" in navigator)) {
      setError("La geolocalización no está disponible en este navegador.");
      return;
    }

    setLocationLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFocusLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      (geoError) => {
        setLocationLoading(false);
        setError(`No se pudo obtener tu ubicación: ${geoError.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    );
  };

  return (
    <div className="login-wrapper relative flex flex-col">
      <div className="absolute top-[20%] right-[-5%] w-72 h-72 bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
      <AnimalFootPrint className="absolute inset-0 w-full h-full z-0 opacity-25 pointer-events-none" />
      <div
        className="absolute bottom-[10%] left-[-10%] w-96 h-96 bg-cyan-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"
        style={{ animationDelay: "1.4s" }}
      ></div>

      <Navbar />

      <main className="flex-1 p-4 pt-28 relative z-10 w-full">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
                Mapa interactivo de censos
              </h1>
              <p className="text-slate-500 font-medium mt-2 text-lg">
                Visualiza los registros geográficos, consulta su información y usa Leaflet de forma nativa dentro de la plataforma.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={loadCensos} disabled={loading}>
                {loading ? "Actualizando..." : "Actualizar mapa"}
              </Button>
              <Button variant="primary" onClick={handleLocateMe} disabled={locationLoading}>
                {locationLoading ? "Buscando ubicación..." : "Usar mi ubicación"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-600 shadow-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <aside className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl border border-white/60 bg-white/85 p-5 shadow-lg shadow-slate-100/70 backdrop-blur-xl">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                    Censos
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-800">
                    {censos.length}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/60 bg-white/85 p-5 shadow-lg shadow-slate-100/70 backdrop-blur-xl">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                    Marcado
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-800">
                    {selectedCenso ? selectedCenso.mascota.nombre : "Ninguno"}
                  </p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/60 bg-white/85 p-5 shadow-2xl shadow-slate-100/70 backdrop-blur-xl">
                <FormInput
                  label="Buscar censo"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Mascota, dueño o proyecto"
                />

                <div className="mt-5 max-h-[420px] space-y-3 overflow-y-auto pr-1">
                  {filteredCensos.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm font-medium text-slate-500">
                      No hay censos que coincidan con el filtro.
                    </div>
                  ) : (
                    filteredCensos.map((censo) => {
                      const active = censo.id === selectedCensoId;
                      return (
                        <button
                          key={censo.id}
                          type="button"
                          onClick={() => setSelectedCensoId(censo.id)}
                          className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                            active
                              ? "border-brand-secondary bg-brand-light/25 shadow-md"
                              : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="mt-1 h-3 w-3 rounded-full shrink-0"
                              style={{ backgroundColor: censo.color || "#4bb8d4" }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-3">
                                <h3 className="truncate text-sm font-bold text-slate-800">
                                  {censo.mascota.nombre}
                                </h3>
                                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                  {censo.mascota.tipo}
                                </span>
                              </div>
                              <p className="mt-1 text-sm font-medium text-slate-500">
                                {censo.dueno.nombres} {censo.dueno.apellidos}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {censo.lat.toFixed(4)}, {censo.lon.toFixed(4)}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </aside>

            <section className="rounded-[2rem] border border-white/60 bg-white/85 p-4 shadow-2xl shadow-blue-100/60 backdrop-blur-xl">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-2 pt-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Mapa Leaflet</h2>
                  <p className="text-sm font-medium text-slate-500">
                    Selecciona un censo para centrarlo o usa tu ubicación para contextualizar el recorrido.
                  </p>
                </div>
                <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  OpenStreetMap + Leaflet
                </div>
              </div>

              <LeafletCensoMap
                censos={filteredCensos}
                activeCensoId={selectedCensoId ?? undefined}
                focusLocation={focusLocation}
                onCensoSelect={(censo) => setSelectedCensoId(censo.id)}
              />

              <div className="mt-4 grid grid-cols-1 gap-3 px-2 pb-2 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Estado</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {loading ? "Sincronizando datos" : "Mapa listo"}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Filtro</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {search.trim() ? "Búsqueda activa" : "Sin filtro"}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Seleccionado</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700 truncate">
                    {selectedCenso ? selectedCenso.mascota.nombre : "Sin selección"}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};