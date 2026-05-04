"""
Router: Censos.
POST /api/v1/censos — Registrar censo (con auth, validar FK y Base64).
GET  /api/v1/censos — Listar censos con DTO anidado (con auth).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from ..dependencies import get_db, get_current_user
from ..models.censo import Censo
from ..models.mascota import Mascota
from ..models.persona import Persona
from ..schemas.censo import (
    CensoCreate,
    CensoResponse,
    CensoDetalleResponse,
    MascotaEnCenso,
    DuenoEnCenso,
)

router = APIRouter(prefix="/censos", tags=["Censos"])


@router.post(
    "",
    response_model=CensoResponse,
    status_code=status.HTTP_201_CREATED,
)
def crear_censo(
    body: CensoCreate,
    db: Session = Depends(get_db),
    _user_id: str = Depends(get_current_user),
):
    """
    Registra un nuevo evento de censo.

    Validaciones:
    - JWT válido y no expirado.
    - idMascota debe existir en la base de datos.
    - idDueno debe existir en la base de datos.
    - La fotografía Base64 no supera 50 KB (validado en el schema).
    - idProyecto y color son obligatorios.
    """
    # Validar que la mascota existe
    mascota = db.query(Mascota).filter(Mascota.id == body.id_mascota).first()
    if mascota is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe una mascota con id={body.id_mascota}.",
        )

    # Validar que el dueño existe
    dueno = db.query(Persona).filter(Persona.id == body.id_dueno).first()
    if dueno is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe una persona con id={body.id_dueno}.",
        )

    censo = Censo(
        id=body.id,
        id_mascota=body.id_mascota,
        id_dueno=body.id_dueno,
        fotografia=body.fotografia,
        lat=body.lat,
        lon=body.lon,
        id_proyecto=body.id_proyecto,
        color=body.color,
    )

    db.add(censo)
    db.commit()
    db.refresh(censo)

    return CensoResponse.model_validate(censo)


@router.get("", response_model=list[CensoDetalleResponse])
def listar_censos(
    db: Session = Depends(get_db),
    _user_id: str = Depends(get_current_user),
):
    """
    Retorna todos los censos con la información anidada de mascota y dueño.

    Devuelve un DTO enriquecido (JOIN entre censos, mascotas y personas)
    para evitar múltiples llamadas desde el frontend al renderizar el mapa.
    """
    censos = (
        db.query(Censo)
        .options(joinedload(Censo.mascota), joinedload(Censo.dueno))
        .all()
    )

    resultado = []
    for c in censos:
        detalle = CensoDetalleResponse(
            id=c.id,
            lat=c.lat,
            lon=c.lon,
            id_proyecto=c.id_proyecto,
            color=c.color,
            fotografia_censo=c.fotografia,
            mascota=MascotaEnCenso(
                id=c.mascota.id,
                nombre=c.mascota.nombre,
                tipo=c.mascota.tipo.value if hasattr(c.mascota.tipo, "value") else c.mascota.tipo,
                edad=c.mascota.edad,
            ),
            dueno=DuenoEnCenso(
                id=c.dueno.id,
                nombres=c.dueno.nombres,
                apellidos=c.dueno.apellidos,
                telefono=c.dueno.telefono,
            ),
        )
        resultado.append(detalle)

    return resultado
