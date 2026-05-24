import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearPersonaApi } from "../services/api";
import { hashPassword } from "../utils/crypto";
import { FormInput } from "../components/FormInput";
import { FormSelect } from "../components/FormSelect";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/Button";
import { AnimalFootPrint } from "../components/AnimalFootPrint";

const TIPOS_DOCUMENTO = ["CC", "CE", "Pasaporte", "TI", "NIT"];
const TIPOS_PERSONA = [
  { value: "DUENO", label: "Dueño" },
  { value: "USUARIO", label: "Usuario" },
];

export const PersonaNuevaPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    tipoPersona: "DUENO",
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

    if (form.tipoPersona === "USUARIO") {
      if (!form.usuario) {
        setError("El usuario es obligatorio");
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
      const { confirmarContrasena, contrasena, tipoPersona, ...rest } = form;
      void confirmarContrasena;
      void tipoPersona;
      const contrasenaHash = contrasena ? await hashPassword(contrasena) : "";
      await crearPersonaApi({
        ...rest,
        usuario: tipoPersona === "USUARIO" ? rest.usuario : null,
        contrasena: tipoPersona === "USUARIO" ? contrasenaHash : undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al registrar persona",
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
              ✓
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Persona registrada
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

      <Navbar></Navbar>
      <main className="flex-1 flex items-center justify-center p-4 relative z-10 w-full">
        <div className="w-full max-w-xl relative p-4 z-10 animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-14">
              Registrar persona
            </h1>
            <p className="text-brand-primary  font-semibold">
              Completa la información del usuario
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
              <FormSelect
                label="Tipo de persona"
                required
                value={form.tipoPersona}
                onChange={(e) => set("tipoPersona", e.target.value)}
                options={TIPOS_PERSONA}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="Nombres"
                  required
                  value={form.nombres}
                  onChange={(e) => set("nombres", e.target.value)}
                  placeholder="Juan Andres"
                  pattern="^[A-Za-z ]+$"
                  title="Solo letras y espacios"
                />
                <FormInput
                  label="Apellidos"
                  required
                  value={form.apellidos}
                  onChange={(e) => set("apellidos", e.target.value)}
                  placeholder="Perez Gomez"
                  pattern="^[A-Za-z ]+$"
                  title="Solo letras y espacios"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormSelect
                  label="Tipo documento"
                  required
                  value={form.tipoDocumento}
                  onChange={(e) => set("tipoDocumento", e.target.value)}
                  options={TIPOS_DOCUMENTO.map((t) => ({ value: t }))}
                />
                <FormInput
                  label="Número documento"
                  required
                  value={form.documento}
                  onChange={(e) => set("documento", e.target.value)}
                  placeholder="1000200300"
                  inputMode="numeric"
                  pattern="^[0-9]+$"
                  title="Solo numeros"
                />
              </div>

              <FormInput
                label="Dirección"
                required
                value={form.direccion}
                onChange={(e) => set("direccion", e.target.value)}
                placeholder="Calle 1 # 2-3"
                pattern="^[A-Za-z0-9 #.-]+$"
                title="Letras, numeros y caracteres # . -"
              />

              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="Telefono"
                  required
                  value={form.telefono}
                  onChange={(e) => set("telefono", e.target.value)}
                  placeholder="3001234567"
                  inputMode="numeric"
                  pattern="^[0-9]+$"
                  title="Solo numeros"
                />
                <FormInput
                  label="Ciudad"
                  required
                  value={form.ciudad}
                  onChange={(e) => set("ciudad", e.target.value)}
                  placeholder="Tunja"
                  pattern="^[A-Za-z ]+$"
                  title="Solo letras y espacios"
                />
              </div>

              {form.tipoPersona === "USUARIO" && (
                <>
                  <FormInput
                    label="Usuario"
                    required
                    value={form.usuario}
                    onChange={(e) => set("usuario", e.target.value)}
                    placeholder="mi_usuario"
                    pattern="^[A-Za-z0-9._-]+$"
                    title="Solo letras, numeros, punto, guion y guion bajo"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormInput
                      label="Contrasena"
                      required
                      type="password"
                      value={form.contrasena}
                      onChange={(e) => set("contrasena", e.target.value)}
                      placeholder="Minimo 6 caracteres"
                    />
                    <FormInput
                      label="Confirmar contrasena"
                      required
                      type="password"
                      value={form.confirmarContrasena}
                      onChange={(e) =>
                        set("confirmarContrasena", e.target.value)
                      }
                      placeholder="Repite la contrasena"
                    />
                  </div>
                </>
              )}

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
