"""Exporta todos los schemas / DTOs."""

from .auth import LoginRequest, LoginResponse  # noqa: F401
from .persona import PersonaCreate, PersonaResponse  # noqa: F401
from .mascota import MascotaCreate, MascotaResponse  # noqa: F401
from .censo import CensoCreate, CensoResponse, CensoDetalleResponse  # noqa: F401
