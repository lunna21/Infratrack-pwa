"""
Schemas Pydantic: Autenticación (Login).
"""

from pydantic import BaseModel


class LoginRequest(BaseModel):
    """Cuerpo de la petición de login."""
    usuario: str
    contrasena: str


class LoginResponse(BaseModel):
    """Respuesta exitosa del login."""
    token: str
    tipoToken: str = "Bearer"
    expiraEn: int  # segundos
