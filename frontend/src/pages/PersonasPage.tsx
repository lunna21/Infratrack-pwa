import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Persona } from "../types";
import { getPersonasApi } from "../services/api";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/Button";
import { FormInput } from "../components/FormInput";
import { FormSelect } from "../components/FormSelect";
import { AnimalFootPrint } from "../components/AnimalFootPrint";

const TIPOS_DOCUMENTO = ["CC", "CE", "Pasaporte", "TI", "NIT"];

export const PersonasPage = () => {
  const navigate = useNavigate();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("TODOS");

  const loadPersonas = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPersonasApi();
      setPersonas(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar personas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPersonas();
  }, []);

  const filteredPersonas = useMemo(() => {
    const query = search.trim().toLowerCase();
    return personas.filter((p) => {
      const fullName = `${p.nombres} ${p.apellidos}`.trim().toLowerCase();
      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        p.documento.toLowerCase().includes(query) ||
        (p.ciudad ?? "").toLowerCase().includes(query);
      const matchesTipo = tipoDocumento === "TODOS" || p.tipoDocumento === tipoDocumento;
      return matchesSearch && matchesTipo;
    });
  }, [personas, search, tipoDocumento]);

  return (
    <div className="login-wrapper relative flex flex-col">
      <div className="absolute top-[20%] right-[-5%] w-72 h-72 bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
      <AnimalFootPrint className="absolute inset-0 w-full h-full z-0 opacity-30 pointer-events-none" />
      <div
        className="absolute bottom-[10%] left-[-10%] w-96 h-96 bg-teal-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"
        style={{ animationDelay: "1.5s" }}
      ></div>

      <Navbar />

      <main className="flex-1 p-4 pt-28 relative z-10 w-full">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Personas registradas
              </h1>
              <p className="text-slate-500 font-medium mt-2">
                Busca y filtra por documento, ciudad o nombre.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={loadPersonas} disabled={loading}>
                {loading ? "Actualizando..." : "Actualizar"}
              </Button>
              <Button variant="primary" onClick={() => navigate("/personas/nueva")}
              >
                Registrar persona
              </Button>
            </div>
          </div>

          <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl shadow-emerald-100/40 border border-white/60 p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <FormInput
                label="Buscar"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre, documento o ciudad"
              />
              <FormSelect
                label="Tipo documento"
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
                options={[
                  { value: "TODOS", label: "Todos" },
                  ...TIPOS_DOCUMENTO.map((t) => ({ value: t, label: t })),
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
                    <th className="py-3 px-4 font-semibold">Documento</th>
                    <th className="py-3 px-4 font-semibold">Telefono</th>
                    <th className="py-3 px-4 font-semibold">Ciudad</th>
                    <th className="py-3 px-4 font-semibold">Usuario</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {filteredPersonas.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 px-4 text-center text-slate-500">
                        No hay personas que coincidan con el filtro.
                      </td>
                    </tr>
                  ) : (
                    filteredPersonas.map((p) => (
                      <tr key={p.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {p.nombres} {p.apellidos}
                        </td>
                        <td className="py-3 px-4">
                          {p.tipoDocumento} {p.documento}
                        </td>
                        <td className="py-3 px-4">{p.telefono}</td>
                        <td className="py-3 px-4">{p.ciudad}</td>
                        <td className="py-3 px-4">
                          {p.usuario ? (
                            <span className="font-semibold text-slate-700">{p.usuario}</span>
                          ) : (
                            <span className="text-slate-400">No aplica</span>
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
