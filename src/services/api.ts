import { API_BASE_URL } from '../config';
import type { LoginRequest, LoginResponse, Persona, Mascota, Censo, CensoDetalle } from '../types';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(err.message || `Error ${res.status}`);
  }
  return res.json();
};

// Auth
export const loginApi = (data: LoginRequest): Promise<LoginResponse> =>
  fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse<LoginResponse>);

// Personas
export const crearPersonaApi = (persona: Persona): Promise<Persona> =>
  fetch(`${API_BASE_URL}/personas`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(persona),
  }).then(handleResponse<Persona>);

export const getPersonasApi = (): Promise<Persona[]> =>
  fetch(`${API_BASE_URL}/personas`, { headers: getAuthHeaders() })
    .then(handleResponse<Persona[]>);

// Mascotas
export const crearMascotaApi = (mascota: Mascota): Promise<Mascota> =>
  fetch(`${API_BASE_URL}/mascotas`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(mascota),
  }).then(handleResponse<Mascota>);

export const getMascotasApi = (): Promise<Mascota[]> =>
  fetch(`${API_BASE_URL}/mascotas`, { headers: getAuthHeaders() })
    .then(handleResponse<Mascota[]>);

// Censos
export const crearCensoApi = (censo: Censo): Promise<Censo> =>
  fetch(`${API_BASE_URL}/censos`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(censo),
  }).then(handleResponse<Censo>);

export const getCensosApi = (): Promise<CensoDetalle[]> =>
  fetch(`${API_BASE_URL}/censos`, { headers: getAuthHeaders() })
    .then(handleResponse<CensoDetalle[]>);