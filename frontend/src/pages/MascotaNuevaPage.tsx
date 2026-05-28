import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearMascotaApi } from "../services/api";
import { TIPO_MAQUINARIA_LABEL } from "../types";
import type { TipoMaquinaria } from "../types";
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
    fotografia: "",
  });

  const set = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      setPreview(dataUrl);
      set("fotografia", dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.nombre) return setError("El nombre/placa del equipo es obligatorio");
    setLoading(true);
    try {
      await crearMascotaApi({ ...form, edad: Number(form.edad) });
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
