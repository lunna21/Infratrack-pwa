"""
Utilidades de seguridad: hash de contraseñas (bcrypt) y JWT.
"""

from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from .config import settings

# ── Hashing de contraseñas ─────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    """Genera un hash bcrypt de la contraseña en texto plano."""
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Verifica una contraseña contra su hash."""
    return pwd_context.verify(plain, hashed)


# ── JWT ────────────────────────────────────────────────────────
def create_access_token(user_id: str) -> tuple[str, int]:
    """
    Crea un token JWT con el userId en el payload.

    Returns:
        tuple: (token_str, expire_seconds)
    """
    expire_seconds = settings.JWT_EXPIRE_MINUTES * 60
    expire = datetime.now(timezone.utc) + timedelta(seconds=expire_seconds)

    payload = {
        "sub": user_id,
        "exp": expire,
    }
    token = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    return token, expire_seconds


def decode_access_token(token: str) -> str | None:
    """
    Decodifica y valida un token JWT.

    Returns:
        El userId (sub) si el token es válido, None en caso contrario.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload.get("sub")
    except JWTError:
        return None
