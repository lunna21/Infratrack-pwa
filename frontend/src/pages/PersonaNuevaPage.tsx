import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { crearPersonaApi } from "../services/api";
import { hashPassword } from "../utils/crypto";
import { FormInput } from "../components/FormInput";
import { FormSelect } from "../components/FormSelect";
import { Navbar } from "../components/Navbar";

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
        id: uuidv4(),
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
      <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
        {/* Decors */}
        <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-slate-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 border border-[#b2ddf7]"></div>

        <Navbar />

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-sm w-full relative z-10">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-900">
              Persona registrada
            </h2>
            <p className="text-gray-500 text-sm mt-2">Volviendo al panel...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
      {/* Decors */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-slate-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>

      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-xl relative z-10 animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Registrar persona
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Completa la informacion del usuario
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  label="Numero documento"
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
                label="Direccion"
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

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  {loading ? "Guardando..." : "Registrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
