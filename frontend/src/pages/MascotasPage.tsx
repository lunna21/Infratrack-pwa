import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Mascota } from "../types";
import { getMascotasApi } from "../services/api";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/Button";
import { FormInput } from "../components/FormInput";
import { FormSelect } from "../components/FormSelect";
import { AnimalFootPrint } from "../components/AnimalFootPrint";

const TIPOS_MASCOTA: Mascota["tipo"][] = ["PERRO", "GATO", "PAJARO", "OTRO"];
const GENEROS_MASCOTA = ["MACHO", "HEMBRA"];

export const MascotasPage = () => {
  const navigate = useNavigate();
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState("TODOS");
  const [genero, setGenero] = useState("TODOS");

  const loadMascotas = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMascotasApi();
      setMascotas(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar mascotas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMascotas();
  }, []);

  const filteredMascotas = useMemo(() => {
    const query = search.trim().toLowerCase();
    return mascotas.filter((m) => {
      const matchesSearch = !query || m.nombre.toLowerCase().includes(query);
      const matchesTipo = tipo === "TODOS" || m.tipo === tipo;
      const matchesGenero = genero === "TODOS" || m.genero === genero;
      return matchesSearch && matchesTipo && matchesGenero;
    });
  }, [mascotas, search, tipo, genero]);

  return (
    <div className="login-wrapper relative flex flex-col">
      <div className="absolute top-[20%] right-[-5%] w-72 h-72 bg-amber-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
      <AnimalFootPrint className="absolute inset-0 w-full h-full z-0 opacity-30 pointer-events-none" />
      <div
        className="absolute bottom-[10%] left-[-10%] w-96 h-96 bg-orange-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"
        style={{ animationDelay: "1.5s" }}
      ></div>

      <Navbar />

      <main className="flex-1 p-4 pt-28 relative z-10 w-full">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Mascotas registradas
              </h1>
              <p className="text-slate-500 font-medium mt-2">
                Filtra y consulta las mascotas registradas.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={loadMascotas} disabled={loading}>
                {loading ? "Actualizando..." : "Actualizar"}
              </Button>
              <Button variant="primary" onClick={() => navigate("/mascotas/nueva")}
              >
                Registrar mascota
              </Button>
            </div>
          </div>

          <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl shadow-orange-100/40 border border-white/60 p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <FormInput
                label="Buscar por nombre"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Firulais"
              />
              <FormSelect
                label="Tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                options={[
                  { value: "TODOS", label: "Todos" },
                  ...TIPOS_MASCOTA.map((t) => ({ value: t, label: t })),
                ]}
              />
              <FormSelect
                label="Genero"
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                options={[
                  { value: "TODOS", label: "Todos" },
                  ...GENEROS_MASCOTA.map((g) => ({ value: g, label: g })),
                ]}
              />
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50/80 border border-red-100 text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-600">
                  <tr className="border-b border-slate-100">
                    <th className="py-3 px-4 font-semibold">Nombre</th>
                    <th className="py-3 px-4 font-semibold">Tipo</th>
                    <th className="py-3 px-4 font-semibold">Genero</th>
                    <th className="py-3 px-4 font-semibold">Edad</th>
                    <th className="py-3 px-4 font-semibold">Foto</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {filteredMascotas.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 px-4 text-center text-slate-500">
                        No hay mascotas que coincidan con el filtro.
                      </td>
                    </tr>
                  ) : (
                    filteredMascotas.map((m) => (
                      <tr key={m.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {m.nombre}
                        </td>
                        <td className="py-3 px-4">{m.tipo}</td>
                        <td className="py-3 px-4">{m.genero}</td>
                        <td className="py-3 px-4">{m.edad}</td>
                        <td className="py-3 px-4">
                          {m.fotografia ? (
                            <a
                              href={m.fotografia}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand-primary font-semibold hover:underline"
                            >
                              Ver
                            </a>
                          ) : (
                            <span className="text-slate-400">Sin foto</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
