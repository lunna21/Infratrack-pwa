"""
Modelo SQLAlchemy: Persona (Dueño / Encuestador).
"""

import uuid
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from ..database import Base
from .guid import GUID


class Persona(Base):
    __tablename__ = "personas"

    id = Column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
    )
    nombres = Column(String(150), nullable=False)
    apellidos = Column(String(150), nullable=False)
    tipo_documento = Column(String(20), nullable=False)
    documento = Column(String(50), nullable=False, unique=True)
    direccion = Column(String(250), nullable=False)
    telefono = Column(String(20), nullable=False)
    ciudad = Column(String(100), nullable=False)
    usuario = Column(String(80), nullable=False, unique=True)
    contrasena = Column(String(255), nullable=False)

    # Relación inversa con Censo
    censos = relationship("Censo", back_populates="dueno")
