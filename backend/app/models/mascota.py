"""
Modelo SQLAlchemy: Mascota.
"""

import uuid
import enum
from sqlalchemy import Column, String, Float, Enum, Text
from sqlalchemy.orm import relationship
from ..database import Base
from .guid import GUID


class TipoMascota(str, enum.Enum):
    """Tipos de mascota permitidos."""
    PERRO = "PERRO"
    GATO = "GATO"
    PAJARO = "PAJARO"
    OTRO = "OTRO"


class Mascota(Base):
    __tablename__ = "mascotas"

    id = Column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
    )
    nombre = Column(String(100), nullable=False)
    tipo = Column(Enum(TipoMascota), nullable=False)
    genero = Column(String(20), nullable=False)
    edad = Column(Float, nullable=False)
    fotografia = Column(Text, nullable=True)

    # Relación inversa con Censo
    censos = relationship("Censo", back_populates="mascota")
