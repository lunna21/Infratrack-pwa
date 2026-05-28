import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { crearPersonaApi } from "../services/api";
import { hashPassword } from "../utils/crypto";
import { FormInput } from "../components/FormInput";
import { FormSelect } from "../components/FormSelect";
import { Button } from "../components/Button";
import logo from "../assets/logo.png";
import { LuCheck } from "react-icons/lu";

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
      setError(err instanceof Error ? err.message : "Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 text-center max-w-sm w-full animate-slide-up">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-6">
            <LuCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Solicitud enviada
          </h2>
          <p className="text-slate-500 font-medium mt-3 text-sm">
            Te redirigiremos al inicio de sesión...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrapper">
      <div className="w-full max-w-xl relative z-10 animate-slide-up">
        <div className="text-center mb-6 flex flex-col items-center">
          <img src={logo || "/placeholder.svg"} alt="Infratrack" className="w-14 h-14 object-contain mb-4" />
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Solicitud de acceso a Infratrack
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Paso {step} <span className="text-slate-400">de 2</span>
          </p>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-1.5 mb-6 overflow-hidden">
          <div
            className="bg-brand-primary h-full rounded-full transition-all duration-500"
            style={{ width: step === 1 ? "50%" : "100%" }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-10">
          {error && (
            <div className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4 animate-fade-in">
              <h2 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3 mb-3">
                Información personal
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <FormInput label="Nombres" required value={form.nombres}
                  onChange={(e) => set("nombres", e.target.value)}
                  placeholder="Juan Andrés"
                  pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$" title="Solo letras y espacios" />
                <FormInput label="Apellidos" required value={form.apellidos}
                  onChange={(e) => set("apellidos", e.target.value)}
                  placeholder="Pérez Gómez"
                  pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$" title="Solo letras y espacios" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormSelect label="Tipo documento" required value={form.tipoDocumento}
                  onChange={(e) => set("tipoDocumento", e.target.value)}
                  options={TIPOS_DOCUMENTO.map((t) => ({ value: t }))} />
                <FormInput label="Número de documento" required value={form.documento}
                  onChange={(e) => set("documento", e.target.value)} placeholder="1000200300"
                  inputMode="numeric" pattern="^[0-9]+$" title="Solo números" />
              </div>

              <FormInput label="Dirección" required value={form.direccion}
                onChange={(e) => set("direccion", e.target.value)}
                placeholder="Calle 1 # 2-3" />

              <div className="grid grid-cols-2 gap-3">
                <FormInput label="Teléfono" required value={form.telefono}
                  onChange={(e) => set("telefono", e.target.value)} placeholder="3001234567"
                  inputMode="numeric" pattern="^[0-9]{10,10}$" />
                <FormInput label="Ciudad" required value={form.ciudad}
                  onChange={(e) => set("ciudad", e.target.value)} placeholder="Bogotá" />
              </div>

              <div className="pt-2">
                <Button variant="primary" type="submit" fullWidth>
                  Continuar
                </Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
              <h2 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3 mb-3">
                Credenciales corporativas
              </h2>

              <FormInput label="Usuario" required value={form.usuario}
                onChange={(e) => set("usuario", e.target.value)}
                placeholder="usuario.corporativo"
                pattern="^[A-Za-z0-9._\-]{4,20}$" />

              <FormInput label="Contraseña" required type="password"
                value={form.contrasena}
                pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$"
                title="Mínimo 6 caracteres, con letra y número"
                onChange={(e) => set("contrasena", e.target.value)}
                placeholder="Mínimo 6 caracteres" />

              <FormInput label="Confirmar contraseña" required type="password"
                value={form.confirmarContrasena}
                onChange={(e) => set("confirmarContrasena", e.target.value)}
                placeholder="Repite la contraseña" />

              <div className="flex gap-3 pt-3">
                <Button type="button" onClick={() => setStep(1)} variant="outline" className="flex-1">
                  Volver
                </Button>
                <Button type="submit" disabled={loading} variant="primary" className="flex-1" isLoading={loading}>
                  Enviar solicitud
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-sm font-medium text-slate-500">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="login-link">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
