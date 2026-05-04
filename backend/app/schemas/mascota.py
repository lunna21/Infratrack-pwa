"""
Schemas Pydantic: Mascota.
"""

from uuid import UUID
from pydantic import BaseModel, ConfigDict
from ..models.mascota import TipoMascota


class MascotaCreate(BaseModel):
    """DTO para crear una mascota."""
    id: UUID
    nombre: str
    tipo: TipoMascota
    genero: str
    edad: float
    fotografia: str | None = None


class MascotaResponse(BaseModel):
    """DTO de respuesta para mascota."""
    id: UUID
    nombre: str
    tipo: TipoMascota
    genero: str
    edad: float
    fotografia: str | None = None

    model_config = ConfigDict(from_attributes=True)
