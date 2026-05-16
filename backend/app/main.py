"""
Punto de entrada de la aplicación FastAPI.
Configura CORS, incluye los routers y crea las tablas al iniciar.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import engine, Base
from .models import Persona, Mascota, Censo  # noqa: F401  — registrar modelos
from .routers import auth, personas, mascotas, censos


# ── Lifespan: crear tablas al iniciar ─────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Crea las tablas de la BD si no existen al iniciar el servidor."""
    Base.metadata.create_all(bind=engine)
    yield


# ── Aplicación FastAPI ─────────────────────────────────────────
app = FastAPI(
    title="API Censo de Mascotas",
    description="API REST para el censo de mascotas — PWA Electiva III",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ───────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers bajo /api/v1 ──────────────────────────────────────
API_PREFIX = "/api/v1"
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(personas.router, prefix=API_PREFIX)
app.include_router(mascotas.router, prefix=API_PREFIX)
app.include_router(censos.router, prefix=API_PREFIX)


# ── Health check ───────────────────────────────────────────────
@app.get("/", tags=["Health"])
def health_check():
    """Verificación rápida de que el servidor está corriendo."""
    return {"status": "ok", "message": "API Censo de Mascotas v1.0.0"}
