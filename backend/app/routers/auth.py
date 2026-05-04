"""
Router: Autenticación.
POST /api/v1/auth/login — Login con usuario/contraseña → JWT.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..dependencies import get_db
from ..models.persona import Persona
from ..schemas.auth import LoginRequest, LoginResponse
from ..security import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """
    Autentica al usuario y retorna un token JWT.

    - Busca la persona por campo `usuario`.
    - Compara la contraseña contra el hash almacenado (bcrypt).
    - Genera un JWT con el `userId` en el payload.
    """
    persona = db.query(Persona).filter(Persona.usuario == body.usuario).first()

    if persona is None or not verify_password(body.contrasena, persona.contrasena):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas.",
        )

    token, expire_seconds = create_access_token(str(persona.id))

    return LoginResponse(
        token=token,
        tipoToken="Bearer",
        expiraEn=expire_seconds,
    )
