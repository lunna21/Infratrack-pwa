import { useMemo, useState } from "react";
import useSWR from "swr";
import { Navbar } from "../components/Navbar";
import { getCensosApi, getMascotasApi, getPersonasApi } from "../services/api";
import type { CensoDetalle, Mascota, Persona } from "../types";
import { TIPO_MAQUINARIA_LABEL } from "../types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";

const PALETTE = ["#F97316", "#0F172A", "#0EA5E9", "#22C55E", "#EAB308", "#A855F7"];

const fmtDate = (id: string) => {
  const ts = Number(id);
  if (!Number.isFinite(ts)) return id.slice(0, 10);
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return id.slice(0, 10);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
};

const dayKey = (id: string) => {
  const ts = Number(id);
  if (!Number.isFinite(ts)) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toISOString().slice(0, 10);
};

export const ReportesPage = () => {
  const [proyecto, setProyecto] = useState<string>("TODOS");

  const { data: censos = [] } = useSWR<CensoDetalle[]>("censos", getCensosApi, {
    revalidateOnFocus: false,
  });
  const { data: maquinaria = [] } = useSWR<Mascota[]>("mascotas", getMascotasApi, {
    revalidateOnFocus: false,
  });
  const { data: personal = [] } = useSWR<Persona[]>("personas", getPersonasApi, {
    revalidateOnFocus: false,
  });

  const proyectos = useMemo(() => {
    const set = new Set<string>();
    censos.forEach((c) => c.idProyecto && set.add(c.idProyecto));
    return Array.from(set).sort();
  }, [censos]);

  const filtered = useMemo(
    () => (proyecto === "TODOS" ? censos : censos.filter((c) => c.idProyecto === proyecto)),
    [censos, proyecto],
  );

  const porTipo = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((c) => {
      const tipo = TIPO_MAQUINARIA_LABEL[c.mascota?.tipo as keyof typeof TIPO_MAQUINARIA_LABEL] || "Otro";
      counts[tipo] = (counts[tipo] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const porProyecto = useMemo(() => {
    const counts: Record<string, number> = {};
    censos.forEach((c) => {
      counts[c.idProyecto || "Sin frente"] = (counts[c.idProyecto || "Sin frente"] ?? 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [censos]);

  const porDia = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((c) => {
      const k = dayKey(c.id);
      counts[k] = (counts[k] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-10)
      .map(([name, value]) => ({ name: name.slice(5), registros: value }));
  }, [filtered]);

  const exportarPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const now = new Date().toLocaleString("es-CO");

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 612, 70, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Infratrack — Reporte de gestión de obra", 36, 36);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generado: ${now}`, 36, 54);
    doc.text(`Frente: ${proyecto === "TODOS" ? "Todos los proyectos" : proyecto}`, 380, 54);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Resumen ejecutivo", 36, 100);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Registros de campo: ${filtered.length}`, 36, 118);
    doc.text(`Maquinaria registrada: ${maquinaria.length}`, 36, 134);
    doc.text(`Personal activo: ${personal.length}`, 36, 150);
    doc.text(`Frentes de obra: ${proyectos.length}`, 36, 166);

    autoTable(doc, {
      startY: 190,
      head: [["Fecha", "Frente", "Maquinaria", "Tipo", "Responsable", "Coordenadas"]],
      body: filtered.map((c) => [
        fmtDate(c.id),
        c.idProyecto,
        c.mascota?.nombre ?? "—",
        TIPO_MAQUINARIA_LABEL[c.mascota?.tipo as keyof typeof TIPO_MAQUINARIA_LABEL] || "—",
        `${c.dueno?.nombres ?? ""} ${c.dueno?.apellidos ?? ""}`.trim(),
        `${c.lat.toFixed(5)}, ${c.lon.toFixed(5)}`,
      ]),
      headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: "bold" },
      bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 36, right: 36 },
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i += 1) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Infratrack · Documento controlado · Página ${i} de ${pageCount}`, 36, 770);
    }

    doc.save(`infratrack-reporte-${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar title="Reportes y analítica" subtitle="Indicadores operativos y trazabilidad de campo" />

      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <div className="corp-card flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="corp-eyebrow">Filtro</p>
            <p className="text-base font-bold text-slate-900">Selecciona el frente de obra</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={proyecto}
              onChange={(e) => setProyecto(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="TODOS">Todos los proyectos</option>
              {proyectos.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={exportarPdf}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-accent/90"
            >
              Exportar PDF
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <section className="corp-card p-6">
            <p className="corp-eyebrow">Distribución</p>
            <h2 className="mb-4 text-lg font-bold text-slate-900">Maquinaria por tipo</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={porTipo}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {porTipo.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="corp-card p-6">
            <p className="corp-eyebrow">Top frentes</p>
            <h2 className="mb-4 text-lg font-bold text-slate-900">Registros por proyecto</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porProyecto}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#475569" }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#F97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="corp-card p-6 lg:col-span-2">
            <p className="corp-eyebrow">Tendencia</p>
            <h2 className="mb-4 text-lg font-bold text-slate-900">Registros recientes (últimos 10 días)</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={porDia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#475569" }} allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="registros"
                    stroke="#0F172A"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#F97316" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <section className="corp-card mt-6 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 px-6 py-4">
            <div>
              <p className="corp-eyebrow">Bitácora</p>
              <h2 className="text-base font-bold text-slate-900">Registros de campo auditables</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {filtered.length} registros
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Fecha</th>
                  <th className="px-6 py-3">Frente</th>
                  <th className="px-6 py-3">Maquinaria</th>
                  <th className="px-6 py-3">Tipo</th>
                  <th className="px-6 py-3">Responsable</th>
                  <th className="px-6 py-3">Coordenadas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                      No hay registros para el filtro seleccionado.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60">
                      <td className="px-6 py-3 font-mono text-xs text-slate-500">{fmtDate(c.id)}</td>
                      <td className="px-6 py-3 font-bold text-slate-800">{c.idProyecto}</td>
                      <td className="px-6 py-3 text-slate-700">{c.mascota?.nombre ?? "—"}</td>
                      <td className="px-6 py-3">
                        <span className="rounded-md bg-accent/10 px-2 py-1 text-xs font-bold uppercase tracking-wide text-accent">
                          {TIPO_MAQUINARIA_LABEL[c.mascota?.tipo as keyof typeof TIPO_MAQUINARIA_LABEL] || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-700">
                        {c.dueno?.nombres} {c.dueno?.apellidos}
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-slate-500">
                        {c.lat.toFixed(5)}, {c.lon.toFixed(5)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};
