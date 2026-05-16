import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { crearPersonaApi } from '../services/api';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword } from '../utils/crypto';

const TIPOS_DOCUMENTO = ['CC', 'CE', 'Pasaporte', 'TI', 'NIT'];

export const RegistroPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    tipoDocumento: 'CC',
    documento: '',
    direccion: '',
    telefono: '',
    ciudad: '',
    usuario: '',
    contrasena: '',
    confirmarContrasena: '',
  });

  const set = (field: string, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.contrasena !== form.confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (form.contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const { confirmarContrasena, contrasena, ...rest } = form;
      void confirmarContrasena;
      const contrasenaHash = await hashPassword(contrasena);
      await crearPersonaApi({ ...rest, id: uuidv4(), contrasena: contrasenaHash });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-10 text-center max-w-sm w-full border border-white/50 animate-slide-up">
          <div className="text-6xl mb-6 bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-green-500 shadow-inner">✓</div>
          <h2 className="text-2xl font-bold text-slate-800">¡Registro exitoso!</h2>
          <p className="text-slate-500 font-medium mt-3">Preparando tu entorno, redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-blue-50 py-10 px-4 relative overflow-hidden flex items-center justify-center">
      {/* Elementos decorativos */}
      <div className="absolute top-[20%] right-[-5%] w-72 h-72 bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
      <div className="absolute bottom-[10%] left-[-10%] w-96 h-96 bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '1.5s' }}></div>

      <div className="w-full max-w-lg relative z-10 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 flex items-center justify-center mb-5">
            <img src="/icons/favicon-96x96.png" alt="Logo" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Crea tu cuenta</h1>
          <p className="text-indigo-600 mt-2 font-semibold">Paso {step} <span className="text-slate-400 font-medium">de 2</span></p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200/50 rounded-full h-2.5 mb-8 overflow-hidden backdrop-blur-sm border border-white/40 shadow-inner">
          <div
            className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: step === 1 ? '50%' : '100%' }}
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
            <form onSubmit={handleNext} className="space-y-5 animate-fade-in">
              <h2 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-3 mb-5">Información Personal</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-slate-700">Nombres *</label>
                  <input
                    required
                    value={form.nombres}
                    onChange={e => set('nombres', e.target.value)}
                    placeholder="Ej. Ana María"
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-slate-700">Apellidos *</label>
                  <input
                    required
                    value={form.apellidos}
                    onChange={e => set('apellidos', e.target.value)}
                    placeholder="López Gómez"
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-slate-700">Tipo Doc. *</label>
                  <select
                    value={form.tipoDocumento}
                    onChange={e => set('tipoDocumento', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white cursor-pointer transition-all"
                  >
                    {TIPOS_DOCUMENTO.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-slate-700">Núm. Documento *</label>
                  <input
                    required
                    value={form.documento}
                    onChange={e => set('documento', e.target.value)}
                    placeholder="1000200300"
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-slate-700">Dirección *</label>
                <input
                  required
                  value={form.direccion}
                  onChange={e => set('direccion', e.target.value)}
                  placeholder="Cra. 1 # 2-3, Barrio"
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-slate-700">Teléfono *</label>
                  <input
                    required
                    value={form.telefono}
                    onChange={e => set('telefono', e.target.value)}
                    placeholder="300 123 4567"
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-slate-700">Ciudad *</label>
                  <input
                    required
                    value={form.ciudad}
                    onChange={e => set('ciudad', e.target.value)}
                    placeholder="Tunja"
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-indigo-500/25 transform hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
                >
                  Continuar al paso final
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Credenciales */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
              <h2 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-3 mb-5">Seguridad de la Cuenta</h2>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-slate-700">Nombre de Usuario *</label>
                <input
                  required
                  value={form.usuario}
                  onChange={e => set('usuario', e.target.value)}
                  placeholder="ej. ana_lopez"
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-slate-700">Contraseña *</label>
                <input
                  type="password"
                  required
                  value={form.contrasena}
                  onChange={e => set('contrasena', e.target.value)}
                  placeholder="Mín. 6 caracteres"
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5 mb-2">
                <label className="block text-[13px] font-bold text-slate-700">Confirmar Contraseña *</label>
                <input
                  type="password"
                  required
                  value={form.confirmarContrasena}
                  onChange={e => set('confirmarContrasena', e.target.value)}
                  placeholder="Repite tu contraseña"
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl text-sm transition-colors active:scale-[0.98]"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creando...
                    </span>
                  ) : "Finalizar"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center bg-slate-50/50 p-4 rounded-xl">
            <p className="text-sm font-medium text-slate-500">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};