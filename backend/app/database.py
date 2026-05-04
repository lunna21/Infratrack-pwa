"""
Configuración de SQLAlchemy: engine, sesión y Base declarativa.
Soporta PostgreSQL y SQLite según DATABASE_URL.
"""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

# ── Detección de SQLite para configuraciones especiales ────────
_is_sqlite = settings.DATABASE_URL.startswith("sqlite")

# ── Motor de base de datos ─────────────────────────────────────
if _is_sqlite:
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
    )

    # Habilitar foreign keys en SQLite (deshabilitadas por defecto)
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
else:
    engine = create_engine(settings.DATABASE_URL)

# ── Sesión ─────────────────────────────────────────────────────
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ── Base declarativa ───────────────────────────────────────────
Base = declarative_base()
