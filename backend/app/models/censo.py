"""
Modelo SQLAlchemy: Censo.
"""

import uuid
from sqlalchemy import Column, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base
from .guid import GUID


class Censo(Base):
    __tablename__ = "censos"

    id = Column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
    )
    id_mascota = Column(
        GUID(),
        ForeignKey("mascotas.id"),
        nullable=False,
    )
    id_dueno = Column(
        GUID(),
        ForeignKey("personas.id"),
        nullable=False,
    )
    fotografia = Column(Text, nullable=True)  # Base64 (máx 50 KB)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    id_proyecto = Column(String(100), nullable=False)
    color = Column(String(10), nullable=False)

    # ── Relaciones ─────────────────────────────────────────────
    mascota = relationship("Mascota", back_populates="censos")
    dueno = relationship("Persona", back_populates="censos")
