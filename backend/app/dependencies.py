"""
Dependencias compartidas de FastAPI:
- get_db: sesión de base de datos
- get_current_user: extrae y valida JWT del header Authorization
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .database import SessionLocal
from .security import decode_access_token

# ── Esquema de seguridad HTTP Bearer ───────────────────────────
security_scheme = HTTPBearer()


def get_db():
    """Genera una sesión de BD por request y la cierra al terminar."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> str:
    """
    Extrae el token JWT del header `Authorization: Bearer <token>`,
    lo valida y retorna el userId.

    Raises:
        HTTPException 401 si el token es inválido o expirado.
    """
    token = credentials.credentials
    user_id = decode_access_token(token)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user_id
