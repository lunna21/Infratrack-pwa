"""
Router: Detección de maquinaria con Roboflow.
POST /api/v1/deteccion/maquinaria — recibe una imagen en base64 y la reenvía
al workflow de Roboflow (proxy server-to-server para evitar problemas de CORS
y no exponer la API key en el frontend).
"""

import httpx
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from ..config import settings

router = APIRouter(prefix="/deteccion", tags=["Detección"])


class DeteccionRequest(BaseModel):
    """Imagen a analizar, en base64 (con o sin prefijo data:)."""
    imagen_base64: str
    classes: str = "Excavator, Bull_dozer, Dumb_truck"


def _strip_base64_prefix(data: str) -> str:
    """Quita el prefijo data:...;base64, si viene incluido."""
    idx = data.find(",")
    return data[idx + 1:] if data.startswith("data:") and idx >= 0 else data


@router.post("/maquinaria")
async def detectar_maquinaria(body: DeteccionRequest):
    """
    Reenvía la imagen al workflow de Roboflow y devuelve la respuesta cruda.
    El navegador llama a este endpoint (mismo origen permitido por CORS),
    evitando el bloqueo CORS del endpoint de workflows de Roboflow.
    """
    if not settings.ROBOFLOW_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ROBOFLOW_API_KEY no está configurada en el servidor.",
        )

    base64_image = _strip_base64_prefix(body.imagen_base64)

    # Endpoint directo de Inferencia para el modelo alojado en Roboflow
    model_id = "excavators-cwlh0/5"
    url = f"https://detect.roboflow.com/{model_id}"

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                url,
                params={"api_key": settings.ROBOFLOW_API_KEY},
                data=base64_image,  # La imagen base64 se envía directamente en el body
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"No se pudo contactar a Roboflow: {exc}",
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Roboflow respondió {resp.status_code}: {resp.text[:500]}",
        )

    return resp.json()
