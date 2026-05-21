import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { crearMascotaApi } from "../services/api";
import type { Mascota } from "../types";
import { FormInput } from "../components/FormInput";
import { FormSelect } from "../components/FormSelect";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/Button";
import { AnimalFootPrint } from "../components/AnimalFootPrint";

const TIPOS_MASCOTA: Mascota["tipo"][] = ["PERRO", "GATO", "PAJARO", "OTRO"];
const GENEROS_MASCOTA = [
  { value: "MACHO", label: "Macho" },
  { value: "HEMBRA", label: "Hembra" },
];

export const MascotaNuevaPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    tipo: "PERRO" as Mascota["tipo"],
    genero: "MACHO",
    edad: "",
    fotografia: "",
  });

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const edadNumber = Number(form.edad);
    if (Number.isNaN(edadNumber) || edadNumber <= 0) {
      setError("La edad debe ser un numero mayor que 0");
      return;
    }

    setLoading(true);
    try {
      await crearMascotaApi({
        id: uuidv4(),
        nombre: form.nombre,
        tipo: form.tipo,
        genero: form.genero,
        edad: edadNumber,
        fotografia: form.fotografia || "",
      });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al registrar mascota",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-wrapper relative flex flex-col">
        {/* Elementos decorativos */}
        <div className="absolute top-[20%] right-[-5%] w-72 h-72 bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
        <AnimalFootPrint className="absolute inset-0 w-full h-full z-0 opacity-30 pointer-events-none" />

        <div
          className="absolute bottom-[10%] left-[-10%] w-96 h-96 bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>

        <Navbar />

        <main className="flex-1 flex items-center justify-center p-4 relative z-10 w-full">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-10 text-center max-w-sm w-full border border-white/50 animate-slide-up">
            <div className="text-6xl mb-6 bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-green-500 shadow-inner">
              🐾
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Mascota registrada
            </h2>
            <p className="text-slate-500 font-medium mt-3">
              Volviendo al panel...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="login-wrapper relative flex flex-col">
      {/* Elementos decorativos */}
      <div className="absolute top-[20%] right-[-5%] w-72 h-72 bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
      <AnimalFootPrint className="absolute inset-0 w-full h-full z-0 opacity-30 pointer-events-none" />

      <div
        className="absolute bottom-[10%] left-[-10%] w-96 h-96 bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"
        style={{ animationDelay: "1.5s" }}
      ></div>

      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 relative z-10 w-full">
        <div className="w-full max-w-xl relative z-10 animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Registrar mascota
            </h1>
            <p className="text-brand-primary mt-1 font-semibold">
              Completa la información de la mascota
            </p>
          </div>

          <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-100/50 border border-white/60 p-8 sm:p-10">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50/80 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
              <FormInput
                label="Nombre"
                required
                value={form.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                placeholder="Firulais"
                pattern="^[A-Za-z ]+$"
                title="Solo letras y espacios"
              />

              <div className="grid grid-cols-2 gap-3">
                <FormSelect
                  label="Tipo"
                  required
                  value={form.tipo}
                  onChange={(e) => set("tipo", e.target.value)}
                  options={TIPOS_MASCOTA.map((t) => ({ value: t }))}
                />
                <FormSelect
                  label="Genero"
                  required
                  value={form.genero}
                  onChange={(e) => set("genero", e.target.value)}
                  options={GENEROS_MASCOTA}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="Edad"
                  required
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.edad}
                  onChange={(e) => set("edad", e.target.value)}
                  placeholder="2"
                />
                <FormInput
                  label="Fotografía (URL)"
                  value={form.fotografia}
                  onChange={(e) => set("fotografia", e.target.value)}
                  placeholder="https://..."
                  type="url"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  fullWidth
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  fullWidth
                >
                  {loading ? "Guardando..." : "Registrar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
