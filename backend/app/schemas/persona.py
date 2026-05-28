"""
Schemas Pydantic: Persona.
El campo `contrasena` se excluye de todas las respuestas GET.
"""

from uuid import UUID
from pydantic import BaseModel, ConfigDict


def _to_camel(string: str) -> str:
    """Convierte snake_case a camelCase."""
    parts = string.split("_")
    return parts[0] + "".join(w.capitalize() for w in parts[1:])


class PersonaCreate(BaseModel):
    """DTO para crear una persona (acepta camelCase del frontend)."""
    id: UUID | None = None
    nombres: str
    apellidos: str
    tipo_documento: str
    documento: str
    direccion: str
    telefono: str
    ciudad: str
    usuario: str | None = None
    contrasena: str | None = None

    model_config = ConfigDict(
        alias_generator=_to_camel,
        populate_by_name=True,
    )


class PersonaResponse(BaseModel):
    """
    DTO de respuesta — NUNCA incluye contrasena.
    Mapea desde el ORM que usa snake_case a camelCase para el frontend.
    """
    id: UUID
    nombres: str
    apellidos: str
    tipo_documento: str
    documento: str
    direccion: str
    telefono: str
    ciudad: str
    usuario: str | None = None

    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=_to_camel,
        populate_by_name=True,
    )
