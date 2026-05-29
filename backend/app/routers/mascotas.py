"""
Router: Mascotas.
POST /api/v1/mascotas — Registrar mascota (con auth).
GET  /api/v1/mascotas — Listar mascotas (con auth).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..models.mascota import Mascota
import json

from ..schemas.mascota import MascotaCreate, MascotaResponse

router = APIRouter(prefix="/mascotas", tags=["Mascotas"])


@router.post(
    "",
    response_model=MascotaResponse,
    status_code=status.HTTP_201_CREATED,
)
def crear_mascota(
    body: MascotaCreate,
    db: Session = Depends(get_db),
    _user_id: str = Depends(get_current_user),
):
    """
    Registra la información biográfica de una mascota.
    Requiere JWT válido.
    """
    if body.id is not None:
        existe = db.query(Mascota).filter(Mascota.id == body.id).first()
        if existe:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe una mascota con ese ID.",
            )

    mascota_data = {
        "nombre": body.nombre,
        "tipo": body.tipo,
        "genero": body.genero,
        "edad": body.edad,
        "horas_uso": body.horas_uso,
        "historial": json.dumps(body.historial) if body.historial else None,
        "fotografia": body.fotografia,
    }
    if body.id is not None:
        mascota_data["id"] = body.id

    mascota = Mascota(**mascota_data)

    db.add(mascota)
    db.commit()
    db.refresh(mascota)

    return MascotaResponse.model_validate(mascota)


@router.get("", response_model=list[MascotaResponse])
def listar_mascotas(
    db: Session = Depends(get_db),
    _user_id: str = Depends(get_current_user),
):
    """
    Retorna todas las mascotas registradas.
    Requiere JWT válido.
    """
    mascotas = db.query(Mascota).all()
    return [MascotaResponse.model_validate(m) for m in mascotas]
