import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { crearMascotaApi } from '../services/api';
import type { Mascota } from '../types';
import { FormInput } from '../components/FormInput';
import { FormSelect } from '../components/FormSelect';

const TIPOS_MASCOTA: Mascota['tipo'][] = ['PERRO', 'GATO', 'PAJARO', 'OTRO'];
const GENEROS_MASCOTA = [
  { value: 'MACHO', label: 'Macho' },
  { value: 'HEMBRA', label: 'Hembra' },
];

export const MascotaNuevaPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    nombre: '',
    tipo: 'PERRO' as Mascota['tipo'],
    genero: 'MACHO',
    edad: '',
    fotografia: '',
  });

  const set = (field: string, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const edadNumber = Number(form.edad);
    if (Number.isNaN(edadNumber) || edadNumber <= 0) {
      setError('La edad debe ser un numero mayor que 0');
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
        fotografia: form.fotografia || '',
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrar mascota');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-sm w-full">
          <div className="text-5xl mb-4">🐾</div>
          <h2 className="text-xl font-bold text-gray-900">Mascota registrada</h2>
          <p className="text-gray-500 text-sm mt-2">Volviendo al panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Registrar mascota</h1>
          <p className="text-gray-500 mt-1 text-sm">Completa la informacion de la mascota</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Nombre"
              required
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Firulais"
              pattern="^[A-Za-z ]+$"
              title="Solo letras y espacios"
            />

            <div className="grid grid-cols-2 gap-3">
              <FormSelect
                label="Tipo"
                required
                value={form.tipo}
                onChange={e => set('tipo', e.target.value)}
                options={TIPOS_MASCOTA.map(t => ({ value: t }))}
              />
              <FormSelect
                label="Genero"
                required
                value={form.genero}
                onChange={e => set('genero', e.target.value)}
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
                onChange={e => set('edad', e.target.value)}
                placeholder="2"
              />
              <FormInput
                label="Fotografia (URL)"
                value={form.fotografia}
                onChange={e => set('fotografia', e.target.value)}
                placeholder="https://..."
                type="url"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                {loading ? 'Guardando...' : 'Registrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
