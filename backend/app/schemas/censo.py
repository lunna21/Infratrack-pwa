"""
Schemas Pydantic: Censo.
Incluye validación de tamaño Base64 (máx 50 KB) y DTO anidado para GET.
"""

import base64
from uuid import UUID
from pydantic import BaseModel, ConfigDict, field_validator


def _to_camel(string: str) -> str:
    """Convierte snake_case a camelCase."""
    parts = string.split("_")
    return parts[0] + "".join(w.capitalize() for w in parts[1:])


MAX_FOTO_BYTES = 50 * 1024  # 50 KB


class CensoCreate(BaseModel):
    """DTO para crear un censo. Valida tamaño de imagen Base64."""
    id: UUID | None = None
    id_mascota: UUID
    id_dueno: UUID
    fotografia: str | None = None
    lat: float
    lon: float
    id_proyecto: str
    color: str

    @field_validator("fotografia")
    @classmethod
    def validar_tamano_base64(cls, v: str | None) -> str | None:
        """La fotografía en Base64 no debe superar 50 KB."""
        if v is None:
            return v

        # Extraer datos Base64 puros (quitar header data:image/...;base64,)
        raw = v
        if "," in v:
            raw = v.split(",", 1)[1]

        try:
            decoded = base64.b64decode(raw)
        except Exception:
            raise ValueError("La fotografía no es un Base64 válido.")

        if len(decoded) > MAX_FOTO_BYTES:
            raise ValueError(
                f"La fotografía supera el límite de 50 KB "
                f"({len(decoded) / 1024:.1f} KB recibidos)."
            )
        return v

    model_config = ConfigDict(
        alias_generator=_to_camel,
        populate_by_name=True,
    )


class CensoResponse(BaseModel):
    """DTO básico de respuesta para censo."""
    id: UUID
    id_mascota: UUID
    id_dueno: UUID
    fotografia: str | None = None
    lat: float
    lon: float
    id_proyecto: str
    color: str

    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=_to_camel,
        populate_by_name=True,
    )


# ── DTOs anidados para GET /censos (DTO enriquecido) ──────────

class MascotaEnCenso(BaseModel):
    """Subconjunto de Mascota para el DTO anidado del censo."""
    id: UUID
    nombre: str
    tipo: str
    edad: float

    model_config = ConfigDict(from_attributes=True)


class DuenoEnCenso(BaseModel):
    """Subconjunto de Persona para el DTO anidado del censo."""
    id: UUID
    nombres: str
    apellidos: str
    telefono: str

    model_config = ConfigDict(from_attributes=True)


class CensoDetalleResponse(BaseModel):
    """
    DTO enriquecido que devuelve el censo con mascota y dueño anidados.
    Usado en GET /censos para evitar múltiples llamadas desde el frontend.
    """
    id: UUID
    lat: float
    lon: float
    id_proyecto: str
    color: str
    fotografia_censo: str | None = None
    mascota: MascotaEnCenso
    dueno: DuenoEnCenso

    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=_to_camel,
        populate_by_name=True,
    )
