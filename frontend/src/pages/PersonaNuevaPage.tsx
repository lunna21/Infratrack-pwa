import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearPersonaApi } from "../services/api";
import { hashPassword } from "../utils/crypto";
import { FormInput } from "../components/FormInput";
import { FormSelect } from "../components/FormSelect";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/Button";
import { LuArrowLeft, LuUserPlus, LuCheck } from "react-icons/lu";

const TIPOS_DOCUMENTO = ["CC", "CE", "Pasaporte", "TI", "NIT"];
const ROLES = [
  { value: "RESIDENTE", label: "Residente de obra" },
  { value: "GERENTE", label: "Gerente de proyecto" },
];
const CON_ACCESO = [
  { value: "SI", label: "Crear acceso a la plataforma" },
  { value: "NO", label: "Sólo registrar en directorio" },
];

export const PersonaNuevaPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    conAcceso: "SI",
    rol: "RESIDENTE",
    nombres: "",
    apellidos: "",
    tipoDocumento: "CC",
    documento: "",
    direccion: "",
    telefono: "",
    ciudad: "",
    usuario: "",
    contrasena: "",
    confirmarContrasena: "",
  });

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.conAcceso === "SI") {
      if (!form.usuario) {
        setError("El usuario corporativo es obligatorio");
        return;
      }
      if (form.contrasena !== form.confirmarContrasena) {
        setError("Las contraseñas no coinciden");
        return;
      }
      if (form.contrasena.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        return;
      }
    }

    setLoading(true);
    try {
      const { confirmarContrasena, contrasena, conAcceso, rol, ...rest } = form;
      void confirmarContrasena;
      const contrasenaHash = contrasena ? await hashPassword(contrasena) : "";
      await crearPersonaApi({
        ...rest,
        rol: rol as "GERENTE" | "RESIDENTE",
        usuario: conAcceso === "SI" ? rest.usuario : null,
        contrasena: conAcceso === "SI" ? contrasenaHash : undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate("/personal"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al registrar miembro");
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
            <h2 className="text-2xl font-extrabold text-slate-900">Miembro registrado</h2>
            <p className="text-slate-500 font-medium mt-2">Volviendo al directorio...</p>
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
            onClick={() => navigate("/personal")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-4"
          >
            <LuArrowLeft className="w-4 h-4" /> Volver al directorio
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-lg bg-brand-primary flex items-center justify-center">
              <LuUserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Nuevo miembro del personal
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Registra a un residente o gerente y opcionalmente crea su acceso a la plataforma.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="corp-card p-6 sm:p-8 space-y-6">
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-brand-primary mb-3">
                Datos personales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Nombres" value={form.nombres} onChange={(e) => set("nombres", e.target.value)} required />
                <FormInput label="Apellidos" value={form.apellidos} onChange={(e) => set("apellidos", e.target.value)} required />
                <FormSelect
                  label="Tipo de documento"
                  value={form.tipoDocumento}
                  onChange={(e) => set("tipoDocumento", e.target.value)}
                  options={TIPOS_DOCUMENTO.map((t) => ({ value: t, label: t }))}
                />
                <FormInput label="Número de documento" value={form.documento} onChange={(e) => set("documento", e.target.value)} required />
                <FormInput label="Teléfono" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} />
                <FormInput label="Ciudad" value={form.ciudad} onChange={(e) => set("ciudad", e.target.value)} />
                <div className="md:col-span-2">
                  <FormInput label="Dirección" value={form.direccion} onChange={(e) => set("direccion", e.target.value)} />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-brand-primary mb-3">
                Acceso al sistema
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  label="Tipo de registro"
                  value={form.conAcceso}
                  onChange={(e) => set("conAcceso", e.target.value)}
                  options={CON_ACCESO}
                />
                <FormSelect
                  label="Rol corporativo"
                  value={form.rol}
                  onChange={(e) => set("rol", e.target.value)}
                  options={ROLES}
                />
                {form.conAcceso === "SI" && (
                  <>
                    <FormInput
                      label="Usuario"
                      value={form.usuario}
                      onChange={(e) => set("usuario", e.target.value)}
                      placeholder="ej: jperez"
                      required
                    />
                    <div className="hidden md:block" />
                    <FormInput
                      label="Contraseña"
                      type="password"
                      value={form.contrasena}
                      onChange={(e) => set("contrasena", e.target.value)}
                      required
                    />
                    <FormInput
                      label="Confirmar contraseña"
                      type="password"
                      value={form.confirmarContrasena}
                      onChange={(e) => set("confirmarContrasena", e.target.value)}
                      required
                    />
                  </>
                )}
              </div>
            </section>

            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate("/personal")}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Registrando..." : "Registrar miembro"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
