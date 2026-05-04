"""
Configuración central del proyecto.
Carga variables de entorno desde .env y expone un objeto Settings.
"""

from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # ── Base de datos ──────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./mascotas.db"

    # ── JWT ────────────────────────────────────────────────────
    JWT_SECRET_KEY: str = "cambia-esta-clave-secreta-en-produccion"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    # ── CORS ───────────────────────────────────────────────────
    CORS_ORIGINS: str = '["http://localhost:5173","http://localhost:3000"]'

    @property
    def cors_origins_list(self) -> List[str]:
        """Parsea la cadena JSON de orígenes CORS a una lista de strings."""
        try:
            return json.loads(self.CORS_ORIGINS)
        except (json.JSONDecodeError, TypeError):
            return ["http://localhost:5173"]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()
