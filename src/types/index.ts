export interface Persona {
  id: string;
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  documento: string;
  direccion: string;
  telefono: string;
  ciudad: string;
  usuario: string;
  contrasena?: string;
}

export interface Mascota {
  id: string;
  nombre: string;
  tipo: 'PERRO' | 'GATO' | 'PAJARO' | 'OTRO';
  genero: string;
  edad: number;
  fotografia: string;
}

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
  login: (data: LoginResponse, usuario: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}