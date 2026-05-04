"""
Router: Personas.
POST /api/v1/personas — Registro de persona (sin auth).
GET  /api/v1/personas — Listar personas sin contrasena (con auth).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..models.persona import Persona
from ..schemas.persona import PersonaCreate, PersonaResponse
from ..security import hash_password

router = APIRouter(prefix="/personas", tags=["Personas"])


@router.post(
    "",
    response_model=PersonaResponse,
    status_code=status.HTTP_201_CREATED,
)
def crear_persona(body: PersonaCreate, db: Session = Depends(get_db)):
    """
    Registra una nueva persona (dueño/encuestador).

    - Hashea la contraseña con bcrypt antes de guardar.
    - No requiere autenticación (registro público).
    """
    # Verificar duplicados por documento o usuario
    existe = db.query(Persona).filter(
        (Persona.documento == body.documento) | (Persona.usuario == body.usuario)
    ).first()

    if existe:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una persona con ese documento o usuario.",
        )

    persona = Persona(
        id=body.id,
        nombres=body.nombres,
        apellidos=body.apellidos,
        tipo_documento=body.tipo_documento,
        documento=body.documento,
        direccion=body.direccion,
        telefono=body.telefono,
        ciudad=body.ciudad,
        usuario=body.usuario,
        contrasena=hash_password(body.contrasena),
    )

    db.add(persona)
    db.commit()
    db.refresh(persona)

    return PersonaResponse.model_validate(persona)


@router.get("", response_model=list[PersonaResponse])
def listar_personas(
    db: Session = Depends(get_db),
    _user_id: str = Depends(get_current_user),
):
    """
    Retorna todas las personas registradas.

    - Requiere JWT válido.
    - El campo `contrasena` es excluido del DTO de respuesta.
    """
    personas = db.query(Persona).all()
    return [PersonaResponse.model_validate(p) for p in personas]
