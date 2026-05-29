"""
Schemas Pydantic: Mascota.
"""

import base64
import json
from uuid import UUID
from pydantic import BaseModel, ConfigDict, field_validator
from ..models.mascota import TipoMascota

MAX_FOTO_BYTES = 50 * 1024  # 50 KB


class HistorialEvento(BaseModel):
    fecha: str
    estado: str
    nota: str | None = None


class MascotaCreate(BaseModel):
    """DTO para crear una mascota."""
    id: UUID | None = None
    nombre: str
    tipo: TipoMascota
    genero: str
    edad: float
    horas_uso: float = 0
    historial: list[HistorialEvento] | None = None
    fotografia: str | None = None

    @field_validator("fotografia")
    @classmethod
    def validar_tamano_base64(cls, v: str | None) -> str | None:
        """La fotografía en Base64 no debe superar 50 KB."""
        if v is None:
            return v

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

    @field_validator("horas_uso")
    @classmethod
    def validar_horas_uso(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Las horas de uso no pueden ser negativas.")
        return v


class MascotaResponse(BaseModel):
    """DTO de respuesta para mascota."""
    id: UUID
    nombre: str
    tipo: TipoMascota
    genero: str
    edad: float
    horas_uso: float = 0
    historial: list[HistorialEvento] | None = None
    fotografia: str | None = None

    @field_validator("historial", mode="before")
    @classmethod
    def parsear_historial(cls, v: str | list[dict] | None):
        if v is None:
            return None
        if isinstance(v, list):
            return v
        try:
            return json.loads(v)
        except Exception:
            return None

    model_config = ConfigDict(from_attributes=True)
