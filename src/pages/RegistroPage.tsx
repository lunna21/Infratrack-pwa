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
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-sm w-full">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900">¡Registro exitoso!</h2>
          <p className="text-gray-500 text-sm mt-2">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-35 h-35 bg-white-600 rounded-2xl mb-4 ">
              <img src="/icons/favicon-96x96.png" alt="Logo" className="w-30 h-30 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="text-gray-500 mt-1 text-sm">Paso {step} de 2</p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Datos personales */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <h2 className="font-semibold text-gray-800 mb-4">Datos personales</h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombres *</label>
                  <input
                    required
                    value={form.nombres}
                    onChange={e => set('nombres', e.target.value)}
                    placeholder="Juan Andrés"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Apellidos *</label>
                  <input
                    required
                    value={form.apellidos}
                    onChange={e => set('apellidos', e.target.value)}
                    placeholder="Pérez Gómez"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tipo documento *</label>
                  <select
                    value={form.tipoDocumento}
                    onChange={e => set('tipoDocumento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TIPOS_DOCUMENTO.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Número documento *</label>
                  <input
                    required
                    value={form.documento}
                    onChange={e => set('documento', e.target.value)}
                    placeholder="1000200300"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Dirección *</label>
                <input
                  required
                  value={form.direccion}
                  onChange={e => set('direccion', e.target.value)}
                  placeholder="Calle 1 # 2-3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono *</label>
                  <input
                    required
                    value={form.telefono}
                    onChange={e => set('telefono', e.target.value)}
                    placeholder="3001234567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ciudad *</label>
                  <input
                    required
                    value={form.ciudad}
                    onChange={e => set('ciudad', e.target.value)}
                    placeholder="Tunja"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-2"
              >
                Continuar →
              </button>
            </form>
          )}

          {/* Step 2: Credenciales */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-semibold text-gray-800 mb-4">Credenciales de acceso</h2>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Usuario *</label>
                <input
                  required
                  value={form.usuario}
                  onChange={e => set('usuario', e.target.value)}
                  placeholder="mi_usuario"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contraseña *</label>
                <input
                  type="password"
                  required
                  value={form.contrasena}
                  onChange={e => set('contrasena', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Confirmar contraseña *</label>
                <input
                  type="password"
                  required
                  value={form.confirmarContrasena}
                  onChange={e => set('confirmarContrasena', e.target.value)}
                  placeholder="Repite la contraseña"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  ← Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  {loading ? 'Registrando...' : 'Registrarme'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};