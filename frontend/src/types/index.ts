// Roles del sistema corporativo
export type Rol = 'GERENTE' | 'RESIDENTE';

/**
 * Persona = miembro del personal de obra (residente, gerente, operador, etc.)
 * Mantenemos los nombres de campos del backend.
 */
export interface Persona {
  id: string;
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  documento: string;
  direccion: string;
  telefono: string;
  ciudad: string;
  usuario?: string | null;
  contrasena?: string;
  /** Rol corporativo (cargo) */
  rol?: Rol;
}

/**
 * Mascota = pieza de maquinaria pesada en el frente de obra.
 * Reusamos el modelo del backend; el campo "tipo" mapea a clases Roboflow.
 */
export type TipoMaquinaria = 'PERRO' | 'GATO' | 'PAJARO' | 'OTRO';
// PERRO = Excavadora, GATO = Bulldozer, PAJARO = Volqueta, OTRO = Otro equipo
export const TIPO_MAQUINARIA_LABEL: Record<TipoMaquinaria, string> = {
  PERRO: 'Excavadora',
  GATO: 'Bulldozer',
  PAJARO: 'Volqueta',
  OTRO: 'Otro equipo',
};

export const ROBOFLOW_TO_TIPO: Record<string, TipoMaquinaria> = {
  Excavator: 'PERRO',
  excavator: 'PERRO',
  excavators: 'PERRO',
  EXCAVATORS: 'PERRO',
  Bull_dozer: 'GATO',
  bull_dozer: 'GATO',
  bulldozer: 'GATO',
  Dumb_truck: 'PAJARO',
  dumb_truck: 'PAJARO',
  dumptruck: 'PAJARO'
};

export interface HistorialEvento {
  fecha: string;
  estado: string;
  nota?: string | null;
}

export interface Mascota {
  id: string;
  nombre: string;
  tipo: TipoMaquinaria;
  /** Estado operativo: OPERATIVA / MANTENIMIENTO -> reusa "MACHO"/"HEMBRA" */
  genero: string;
  /** Años de antigüedad / horas (escala) */
  edad: number;
  horas_uso: number;
  historial?: HistorialEvento[] | null;
  fotografia: string | null;
}

/**
 * Censo = registro de campo (avistamiento de maquinaria geolocalizado en el frente).
 */
export interface Censo {
  id: string;
  idMascota: string;
  idDueno: string;
  fotografia: string;
  lat: number;
  lon: number;
  idProyecto: string;
  color: string;
}

export interface CensoDetalle extends Censo {
  fotografiaCenso: string;
  mascota: Pick<Mascota, 'id' | 'nombre' | 'tipo' | 'edad'>;
  dueno: Pick<Persona, 'id' | 'nombres' | 'apellidos' | 'telefono'>;
}

export interface LoginRequest {
  usuario: string;
  contrasena: string;
}

export interface LoginResponse {
  token: string;
  tipoToken: string;
  expiraEn: number;
}

export interface AuthContextType {
  token: string | null;
  usuario: string | null;
  rol: Rol | null;
  login: (data: LoginResponse, usuario: string, rol: Rol) => void;
  logout: () => void;
  isAuthenticated: boolean;
}
