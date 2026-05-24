import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { crearPersonaApi } from "../services/api";
import { hashPassword } from "../utils/crypto";
import { FormInput } from "../components/FormInput";
import { FormSelect } from "../components/FormSelect";
import { AnimalFootPrint } from "../components/AnimalFootPrint";
import { Button } from "../components/Button";
import logo from "../assets/logo.png";

const TIPOS_DOCUMENTO = ["CC", "CE", "Pasaporte", "TI", "NIT"];

export const RegistroPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
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

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.contrasena !== form.confirmarContrasena) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (form.contrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const { confirmarContrasena, contrasena, ...rest } = form;
      void confirmarContrasena;
      const contrasenaHash = await hashPassword(contrasena);
      await crearPersonaApi({
        ...rest,
        contrasena: contrasenaHash,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al registrar usuario",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-10 text-center max-w-sm w-full border border-white/50 animate-slide-up">
          <div className="text-6xl mb-6 bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-green-500 shadow-inner">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            ¡Registro exitoso!
          </h2>
          <p className="text-slate-500 font-medium mt-3">
            Preparando tu entorno, redirigiendo al login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrapper">
      {/* Elementos decorativos */}
      <div className="absolute top-[20%] right-[-5%] w-72 h-72 bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
      <AnimalFootPrint className="absolute inset-0 w-full h-full z-0 opacity-30 pointer-events-none" />

      <div
        className="absolute bottom-[10%] left-[-10%] w-96 h-96 bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"
        style={{ animationDelay: "1.5s" }}
      ></div>

      <div className="w-full max-w-xl relative z-10 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-2.5 flex flex-col items-center">
          <div className="w-40 h-40  flex items-center justify-center">
            <img src={logo} alt="Logo" className="w-40 h-40 object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Crea tu cuenta
          </h1>
          <p className="text-brand-primary mt-2 font-semibold">
            Paso {step} <span className="text-slate-400 font-medium">de 2</span>
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200/50 rounded-full h-2.5 mb-4 overflow-hidden backdrop-blur-sm border border-white/40 shadow-inner">
          <div
            className="bg-gradient-to-r from-brand-primary to-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: step === 1 ? "50%" : "100%" }}
          />
        </div>

        <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-100/50 border border-white/60 p-8 sm:p-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50/80 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
              <span className="text-red-500">⚠️</span>
              {error}
            </div>
          )}

          {/* Step 1: Datos personales */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-3 animate-fade-in">
              <h2 className="font-bold text-slate-800 text-xl border-b border-slate-100 pb-3 mb-3">
                Información Personal
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="Nombres"
                  required
                  value={form.nombres}
                  onChange={(e) => set("nombres", e.target.value)}
                  placeholder="Juan Andres"
                  pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$"
                  title="Solo letras y espacios"
                />
                <FormInput
                  label="Apellidos"
                  required
                  value={form.apellidos}
                  onChange={(e) => set("apellidos", e.target.value)}
                  placeholder="Perez Gomez"
                  pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$"
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
                pattern="^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ #.,\-]+$"
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
                  pattern="^[0-9]{10,10}$"
                  title="Solo numeros"
                />
                <FormInput
                  label="Ciudad"
                  required
                  value={form.ciudad}
                  onChange={(e) => set("ciudad", e.target.value)}
                  placeholder="Tunja"
                  pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$"
                  title="Solo letras y espacios"
                />
              </div>

              <div className="pt-2">
                <Button variant="primary" type="submit" fullWidth>
                  Continuar al paso final
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: Credenciales */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
              <h2 className="font-bold text-slate-800 text-xl border-b border-slate-100 pb-3 mb-4">
                Seguridad de la Cuenta
              </h2>

              <FormInput
                label="Usuario"
                required
                value={form.usuario}
                onChange={(e) => set("usuario", e.target.value)}
                placeholder="mi_usuario"
                pattern="^[A-Za-z0-9._\-]{4,20}$"
                title="Solo letras, numeros, punto, guion y guion bajo"
              />

              <FormInput
                label="Contraseña"
                required
                type="password"
                value={form.contrasena}
                pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$"
                title="Minimo 6 caracteres, al menos una letra y un numero"
                onChange={(e) => set("contrasena", e.target.value)}
                placeholder="Minimo 6 caracteres"
              />

              <FormInput
                label="Confirmar contraseña"
                required
                type="password"
                value={form.confirmarContrasena}
                onChange={(e) => set("confirmarContrasena", e.target.value)}
                placeholder="Repite la contrasena"
              />

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1"
                >
                  Volver
                </Button>

                <Button
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  className="flex-1"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Creando...
                    </span>
                  ) : (
                    "Finalizar"
                  )}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-4 text-center bg-slate-50/50 p-1 rounded-xl">
            <p className="text-sm font-medium text-slate-500">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="login-link">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
