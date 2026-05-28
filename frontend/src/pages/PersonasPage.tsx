import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Persona } from "../types";
import { getPersonasApi } from "../services/api";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/Button";
import { FormInput } from "../components/FormInput";
import { FormSelect } from "../components/FormSelect";
import { LuUsers, LuUserPlus, LuRefreshCw, LuHardHat, LuPhone, LuMapPin } from "react-icons/lu";

const TIPOS_DOCUMENTO = ["CC", "CE", "Pasaporte", "TI", "NIT"];

const ROL_LABEL: Record<string, string> = {
  GERENTE: "Gerente",
  RESIDENTE: "Residente",
};

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
      setError(err instanceof Error ? err.message : "Error al cargar personal");
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
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 px-4 sm:px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-primary mb-2">
                <LuUsers className="w-3.5 h-3.5" />
                Personal de obra
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Directorio del equipo
              </h1>
              <p className="text-slate-500 font-medium mt-1.5 max-w-2xl">
                Administra residentes, gerentes y operadores asignados a los frentes de obra activos.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={loadPersonas} disabled={loading}>
                <LuRefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Actualizando..." : "Actualizar"}
              </Button>
              <Button variant="primary" onClick={() => navigate("/personal/nuevo")}>
                <LuUserPlus className="w-4 h-4 mr-2" />
                Nuevo miembro
              </Button>
            </div>
          </div>

          <div className="corp-card p-5 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Buscar"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre, documento o ciudad"
              />
              <FormSelect
                label="Tipo de documento"
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
                options={[
                  { value: "TODOS", label: "Todos" },
                  ...TIPOS_DOCUMENTO.map((t) => ({ value: t, label: t })),
                ]}
              />
              <div className="flex items-end">
                <div className="w-full px-4 py-3 rounded-lg bg-slate-100 border border-slate-200 text-sm font-bold text-slate-700">
                  {filteredPersonas.length} resultado{filteredPersonas.length === 1 ? "" : "s"}
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
              Cargando personal...
            </div>
          ) : filteredPersonas.length === 0 ? (
            <div className="corp-card p-12 text-center">
              <LuUsers className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600 font-bold">Sin resultados</p>
              <p className="text-slate-400 text-sm font-medium mt-1">
                Ajusta los filtros o registra un nuevo miembro del equipo.
              </p>
            </div>
          ) : (
            <div className="corp-card overflow-hidden">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3">Miembro</th>
                      <th className="px-5 py-3">Documento</th>
                      <th className="px-5 py-3">Rol</th>
                      <th className="px-5 py-3">Contacto</th>
                      <th className="px-5 py-3">Ubicación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPersonas.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                              {(p.nombres?.[0] ?? "?").toUpperCase()}
                              {(p.apellidos?.[0] ?? "").toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">
                                {p.nombres} {p.apellidos}
                              </div>
                              {p.usuario && (
                                <div className="text-xs font-mono text-slate-500">@{p.usuario}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-bold uppercase text-slate-500 tracking-wide">{p.tipoDocumento}</span>
                          <div className="font-mono text-slate-900 font-semibold">{p.documento}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                              p.rol === "GERENTE"
                                ? "bg-orange-100 text-orange-700 border border-orange-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            <LuHardHat className="w-3 h-3" />
                            {ROL_LABEL[p.rol ?? ""] ?? "Operador"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                            <LuPhone className="w-3.5 h-3.5 text-slate-400" />
                            {p.telefono || "—"}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <LuMapPin className="w-3.5 h-3.5 text-slate-400" />
                            {p.ciudad || "—"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden divide-y divide-slate-100">
                {filteredPersonas.map((p) => (
                  <div key={p.id} className="p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {(p.nombres?.[0] ?? "?").toUpperCase()}
                      {(p.apellidos?.[0] ?? "").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 truncate">
                        {p.nombres} {p.apellidos}
                      </div>
                      <div className="text-xs font-mono text-slate-500 mt-0.5">
                        {p.tipoDocumento} {p.documento}
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            p.rol === "GERENTE"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {ROL_LABEL[p.rol ?? ""] ?? "Operador"}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{p.ciudad || "—"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
