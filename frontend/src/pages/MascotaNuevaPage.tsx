import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearMascotaApi } from "../services/api";
import { TIPO_MAQUINARIA_LABEL } from "../types";
import type { HistorialEvento, TipoMaquinaria } from "../types";
import { FormInput } from "../components/FormInput";
import { FormSelect } from "../components/FormSelect";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/Button";
import { LuArrowLeft, LuTruck, LuCheck, LuUpload } from "react-icons/lu";

const TIPOS = (Object.keys(TIPO_MAQUINARIA_LABEL) as TipoMaquinaria[]).map((k) => ({
  value: k,
  label: TIPO_MAQUINARIA_LABEL[k],
}));

const ESTADOS = [
  { value: "MACHO", label: "Operativa" },
  { value: "HEMBRA", label: "En mantenimiento" },
];

// El backend rechaza fotos cuyo Base64 decodificado supere 50 KB (422).
// Comprimimos/redimensionamos en el cliente para mantenernos por debajo del límite.
const MAX_FOTO_BYTES = 50 * 1024;

const base64Bytes = (dataUrl: string): number => {
  const comma = dataUrl.indexOf(",");
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - padding;
};

const comprimirImagen = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.onload = () => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onerror = () => reject(new Error("Imagen inválida"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("No se pudo procesar la imagen"));

        // Reducimos progresivamente dimensiones y calidad hasta cumplir el límite.
        let maxDim = 800;
        for (let attempt = 0; attempt < 8; attempt++) {
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          let quality = 0.8;
          let dataUrl = canvas.toDataURL("image/jpeg", quality);
          while (base64Bytes(dataUrl) > MAX_FOTO_BYTES && quality > 0.3) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL("image/jpeg", quality);
          }

          if (base64Bytes(dataUrl) <= MAX_FOTO_BYTES) {
            return resolve(dataUrl);
          }
          maxDim = Math.round(maxDim * 0.75);
        }
        reject(new Error("No se pudo comprimir la imagen por debajo de 50 KB"));
      };
      img.src = String(reader.result ?? "");
    };
    reader.readAsDataURL(file);
  });

export const MascotaNuevaPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<string>("");

  const [form, setForm] = useState({
    nombre: "",
    tipo: "PERRO" as TipoMaquinaria,
    genero: "MACHO",
    edad: 1,
    horas_uso: 0,
    historial: [] as HistorialEvento[],
    fotografia: "",
  });

  const set = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleFile = async (file: File) => {
    setError("");
    try {
      const dataUrl = await comprimirImagen(file);
      setPreview(dataUrl);
      set("fotografia", dataUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo procesar la imagen");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.nombre) return setError("El nombre/placa del equipo es obligatorio");
    setLoading(true);
    try {
      await crearMascotaApi({
        ...form,
        edad: Number(form.edad),
        horas_uso: Number(form.horas_uso),
        fotografia: form.fotografia || null,
      });
      setSuccess(true);
      setTimeout(() => navigate("/maquinaria"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al registrar equipo");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="pt-24 px-4 flex items-center justify-center">
          <div className="corp-card p-10 text-center max-w-sm w-full">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <LuCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Equipo registrado</h2>
            <p className="text-slate-500 font-medium mt-2">Volviendo a la flota...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 px-4 sm:px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate("/maquinaria")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-4"
          >
            <LuArrowLeft className="w-4 h-4" /> Volver a la flota
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-lg bg-brand-primary flex items-center justify-center">
              <LuTruck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Registrar nuevo equipo
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Añade una pieza de maquinaria al inventario operativo de la empresa.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="corp-card p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Nombre / Placa"
                value={form.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                placeholder="EX-203 / CAT-D6"
                required
              />
              <FormSelect
                label="Tipo de equipo"
                value={form.tipo}
                onChange={(e) => set("tipo", e.target.value as TipoMaquinaria)}
                options={TIPOS}
              />
              <FormSelect
                label="Estado operativo"
                value={form.genero}
                onChange={(e) => set("genero", e.target.value)}
                options={ESTADOS}
              />
              <FormInput
                label="Años de servicio"
                type="number"
                min={0}
                value={form.edad}
                onChange={(e) => set("edad", Number(e.target.value))}
              />
              <FormInput
                label="Horas de uso"
                type="number"
                min={0}
                value={form.horas_uso}
                onChange={(e) => set("horas_uso", Number(e.target.value))}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Historial operativo
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    set("historial", [
                      ...form.historial,
                      { fecha: new Date().toISOString().slice(0, 10), estado: "Operativa", nota: "" },
                    ])
                  }
                >
                  Agregar evento
                </Button>
              </div>
              {form.historial.length === 0 && (
                <p className="text-xs text-slate-500 font-medium">
                  No hay eventos registrados.
                </p>
              )}
              {form.historial.map((evento, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <FormInput
                    label="Fecha"
                    type="date"
                    value={evento.fecha}
                    onChange={(e) => {
                      const next = [...form.historial];
                      next[idx] = { ...next[idx], fecha: e.target.value };
                      set("historial", next);
                    }}
                  />
                  <FormSelect
                    label="Estado"
                    value={evento.estado}
                    onChange={(e) => {
                      const next = [...form.historial];
                      next[idx] = { ...next[idx], estado: e.target.value };
                      set("historial", next);
                    }}
                    options={[
                      { value: "Operativa", label: "Operativa" },
                      { value: "Mantenimiento", label: "Mantenimiento" },
                    ]}
                  />
                  <FormInput
                    label="Nota"
                    value={evento.nota ?? ""}
                    onChange={(e) => {
                      const next = [...form.historial];
                      next[idx] = { ...next[idx], nota: e.target.value };
                      set("historial", next);
                    }}
                  />
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        set(
                          "historial",
                          form.historial.filter((_, i) => i !== idx),
                        )
                      }
                    >
                      Quitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Fotografía del equipo
              </label>
              <label
                htmlFor="foto-maq"
                className="flex flex-col items-center justify-center gap-2 p-8 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                {preview ? (
                  <img
                    src={preview || "/placeholder.svg"}
                    alt="Preview"
                    className="max-h-48 rounded object-contain"
                  />
                ) : (
                  <>
                    <LuUpload className="w-7 h-7 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700">
                      Arrastra o selecciona una imagen
                    </span>
                  </>
                )}
                <input
                  id="foto-maq"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </label>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/maquinaria")}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Registrando..." : "Registrar equipo"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
