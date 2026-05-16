
## 1. Arquitectura y Stack Tecnológico Recomendado

- **Tipo:** API REST
- **Base de datos:** Relacional PostgreSQL
- **Versión de API:** `/api/v1/`
- **Framework:** FastAPI (Python)
- **Uso de DTOs:** Todas las respuestas deben ser DTOs


## 2. Modelo de Datos

Todas las llaves primarias (PK) deben ser de tipo **UUID** para garantizar identificación unívoca entre todos los proyectos conectados.

### 2.1 Entidad: Mascota

| Campo      | Tipo           | Descripción                                      |
|------------|----------------|--------------------------------------------------|
| id         | UUID           | Identificador único (PK)                         |
| nombre     | String         | Nombre de la mascota                             |
| tipo       | Enum           | Especie: `GATO`, `PERRO`, `PAJARO`, etc.        |
| genero     | String         | Género biológico                                 |
| edad       | Integer        | Edad de la mascota                               |
| fotografia | String         | URL o referencia a la imagen de perfil           |

### 2.2 Entidad: Persona (Dueño / Encuestador)

| Campo          | Tipo   | Descripción                                      |
|----------------|--------|--------------------------------------------------|
| id             | UUID   | Identificador único (PK)                         |
| nombres        | String | Nombres completos                                |
| apellidos      | String | Apellidos completos                              |
| tipoDocumento  | String | CC, CE, Pasaporte, etc.                          |
| documento      | String | Número de identificación                         |
| direccion      | String | Dirección de residencia                          |
| telefono       | String | Número de contacto                               |
| ciudad         | String | Ciudad de residencia                             |
| usuario        | String | Nombre de usuario para login                     |
| contrasena     | String | Hash (bcrypt/Argon2). **Nunca exponer en GET**   |

### 3.3 Entidad: Censo

| Campo       | Tipo           | Descripción                                                     |
|-------------|----------------|-----------------------------------------------------------------|
| id          | UUID           | Identificador único (PK)                                        |
| idMascota   | UUID           | FK → Mascota                                                    |
| idDueno     | UUID           | FK → Persona                                                    |
| fotografia  | String (Base64)| Imagen en Base64. **Máximo 50 Kb**                              |
| lat         | Float/Decimal  | Latitud del punto del censo                                     |
| lon         | Float/Decimal  | Longitud del punto del censo                                    |
| idProyecto  | String/UUID    | Identificador del grupo/proyecto asignado por el docente        |
| color       | String         | Código de color hexadecimal asignado por el docente             |

---

## 3. Endpoints

### 3.1 Autenticación

**POST** `/api/v1/auth/login`

Autentica al usuario y retorna el token JWT.

**Request:**
```json
{
  "usuario": "perez",
  "contrasena": "MiPasswordSeguro123"
}
```

**Response 200 OK:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tipoToken": "Bearer",
  "expiraEn": 3600
}
```

**Reglas:**
- La contraseña recibida se compara contra el hash almacenado (nunca en texto plano).
- El token JWT generado debe contener al menos el `userId` en el payload.
- El token debe tener un tiempo de expiración definido.

---

### 4.2 Personas

**POST** `/api/v1/personas`

Registra un nuevo dueño o encuestador.

**Request:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "nombres": "Hugo Armando",
  "apellidos": "Cristancho Chinome",
  "tipoDocumento": "CC",
  "documento": "1000200300",
  "direccion": "Calle Falsa 123",
  "telefono": "3001234567",
  "ciudad": "Bogotá",
  "usuario": "hcristancho",
  "contrasena": "hash_generado_en_frontend_o_backend"
}
```

**GET** `/api/v1/personas`

Retorna el listado de personas. **El campo `contrasena` debe ser omitido** por seguridad en todas las respuestas GET.

---

### 4.3 Mascotas

**POST** `/api/v1/mascotas`

Registra la información biográfica de una mascota.

**Request:**
```json
{
  "id": "987fcdeb-51a2-43d7-9012-345678901234",
  "nombre": "Firulais",
  "tipo": "PERRO",
  "genero": "MACHO",
  "edad": 3.5,
  "fotografia": "https://midominio.com/images/firulais_perfil.jpg"
}
```

**GET** `/api/v1/mascotas`

Retorna el listado de mascotas registradas.

---

### 4.4 Censos

**POST** `/api/v1/censos`

Registra un nuevo evento de censo. Requiere JWT en el header.

**Header requerido:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "idMascota": "987fcdeb-51a2-43d7-9012-345678901234",
  "idDueno": "123e4567-e89b-12d3-a456-426614174000",
  "fotografia": "data:image/jpeg;base64,/9j/4AAQSkZJRgAB...",
  "lat": 4.60971,
  "lon": -74.08175,
  "idProyecto": "PWA_GRUPO_01",
  "color": "#FF5733"
}
```

**Validaciones obligatorias en el backend:**
- El token JWT debe ser válido y no expirado.
- `idMascota` e `idDueno` deben existir en la base de datos (validación de FK).
- La fotografía en Base64 no debe superar **50 Kb**.
- Los campos `idProyecto` y `color` son obligatorios.

---

**GET** `/api/v1/censos`

Retorna todos los censos con la información anidada de mascota y dueño (DTO enriquecido para el mapa). No requiere autenticación (público para el mapa).

**Response 200 OK:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "lat": 4.60971,
    "lon": -74.08175,
    "idProyecto": "PWA_GRUPO_01",
    "color": "#FF5733",
    "fotografiaCenso": "data:image/jpeg;base64,/9j/4AAQSkZ...",
    "mascota": {
      "id": "987fcdeb-51a2-43d7-9012-345678901234",
      "nombre": "Firulais",
      "tipo": "PERRO",
      "edad": 3.5
    },
    "dueno": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "nombres": "Hugo Armando",
      "apellidos": "Cristancho Chinome",
      "telefono": "3001234567"
    }
  }
]
```

> Este endpoint debe devolver un **DTO con datos anidados** (JOIN entre censos, mascotas y personas) para evitar múltiples llamadas desde el frontend al renderizar el mapa.

---

## 5. Reglas de Seguridad

- El campo `contrasena` debe ser **excluido** de todas las respuestas GET de personas.
- El endpoint `POST /api/v1/censos` debe estar **protegido por JWT**. Cualquier petición sin token válido debe retornar `401 Unauthorized`.
- Validar el tamaño de la imagen Base64 en el backend como segunda línea de defensa

---

## 6. Resumen de Endpoints

| Método | Endpoint               | Autenticación | Descripción                          |
|--------|------------------------|---------------|--------------------------------------|
| POST   | `/api/v1/auth/login`   | No            | Login y generación de JWT            |
| POST   | `/api/v1/personas`     | NO            | Registro de persona/dueño            |
| GET    | `/api/v1/personas`     | SI            | Listar personas (sin contraseña)     |
| POST   | `/api/v1/mascotas`     | SI            | Registro de mascota                  |
| GET    | `/api/v1/mascotas`     | SI            | Listar mascotas                      |
| POST   | `/api/v1/censos`       | SI            | Registrar censo (con foto y coordenadas) |
| GET    | `/api/v1/censos`       | SI            | Listar censos con DTO anidado        |