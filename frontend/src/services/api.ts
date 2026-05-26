import { API_BASE_URL } from '../config';
import type { LoginRequest, LoginResponse, Persona, Mascota, Censo, CensoDetalle } from '../types';
import { enqueueRequest } from '../pwa/offlineQueue';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getStatusMessage = (status: number): string => {
  switch (status) {
    case 400:
      return 'Solicitud inválida.';
    case 401:
      return 'No autorizado. Verifica tus credenciales.';
    case 403:
      return 'No tienes permisos para esta acción.';
    case 404:
      return 'Recurso no encontrado.';
    case 409:
      return 'Conflicto con el estado actual del recurso.';
    case 422:
      return 'Datos inválidos. Revisa el formulario.';
    case 500:
      return 'Error interno del servidor.';
    default:
      return 'Error inesperado en el servidor.';
  }
};

const parseErrorBody = async (res: Response): Promise<string | null> => {
  const text = await res.text().catch(() => '');
  if (!text) return null;

  try {
    const data = JSON.parse(text) as { message?: string; error?: string; detalle?: string };
    return data.message || data.error || data.detalle || text;
  } catch {
    return text;
  }
};

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const bodyMessage = await parseErrorBody(res);
    const statusMessage = getStatusMessage(res.status);
    const finalMessage = bodyMessage ? bodyMessage : statusMessage;
    
    throw new Error(finalMessage);
  }
  return res.json();
};

const requestJson = async <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const method = (init?.method ?? 'GET').toUpperCase();
  const isGet = method === 'GET';
  const url = typeof input === 'string' ? input : undefined;
  const body = typeof init?.body === 'string' ? init.body : null;

  try {
    const res = await fetch(input, init);
    return await handleResponse<T>(res);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.name === 'TypeError') {
        if (!isGet && url) {
          await enqueueRequest({
            url,
            method,
            headers: (init?.headers as Record<string, string>) ?? {},
            body,
          });

          if (body) {
            try {
              return JSON.parse(body) as T;
            } catch {
              return {} as T;
            }
          }
          return {} as T;
        }
        throw new Error('Error de red. Verifica tu conexion y vuelve a intentar.');
      }
      throw err;
    }
    throw new Error('Error de red. Verifica tu conexion y vuelve a intentar.');
  }
};

// Auth
export const loginApi = (data: LoginRequest): Promise<LoginResponse> =>
  requestJson<LoginResponse>(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

// Personas
export const crearPersonaApi = (persona: Omit<Persona, "id">): Promise<Persona> =>
  requestJson<Persona>(`${API_BASE_URL}/personas`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(persona),
  });

export const getPersonasApi = (): Promise<Persona[]> =>
  requestJson<Persona[]>(`${API_BASE_URL}/personas`, { headers: getAuthHeaders() });

// Mascotas
export const crearMascotaApi = (mascota: Omit<Mascota, "id">): Promise<Mascota> =>
  requestJson<Mascota>(`${API_BASE_URL}/mascotas`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(mascota),
  });

export const getMascotasApi = (): Promise<Mascota[]> =>
  requestJson<Mascota[]>(`${API_BASE_URL}/mascotas`, { headers: getAuthHeaders() });

// Censos
export const crearCensoApi = (censo: Omit<Censo, "id">): Promise<Censo> =>
  requestJson<Censo>(`${API_BASE_URL}/censos`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(censo),
  });

export const getCensosApi = (): Promise<CensoDetalle[]> =>
  requestJson<CensoDetalle[]>(`${API_BASE_URL}/censos`, { headers: getAuthHeaders() });