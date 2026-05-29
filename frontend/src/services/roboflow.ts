/**
 * Servicio de detección de maquinaria con Roboflow.
 * Workflow: lunna-sosa/general-segmentation-api-5
 * Clases: Excavator, Bull_dozer, Dumb_truck
 */
import { ROBOFLOW_TO_TIPO, type TipoMaquinaria } from '../types';
import { API_BASE_URL } from '../config';

// Se llama al backend (proxy) en lugar de a Roboflow directamente.
// Esto evita el bloqueo CORS del endpoint de workflows y mantiene la API key
// del lado del servidor en vez de exponerla en el bundle del navegador.
const DETECCION_API_URL = `${API_BASE_URL}/deteccion/maquinaria`;

export interface DeteccionMaquinaria {
  clase: string;
  confianza: number;
  tipoInterno: TipoMaquinaria;
}

export interface ResultadoDeteccion {
  detecciones: DeteccionMaquinaria[];
  raw: unknown;
}

/**
 * Convierte un dataURL a base64 puro (sin prefijo).
 */
const stripBase64Prefix = (dataUrl: string): string => {
  const idx = dataUrl.indexOf(',');
  return idx >= 0 ? dataUrl.slice(idx + 1) : dataUrl;
};

interface RoboflowPrediction {
  class?: string;
  confidence?: number;
}
interface RoboflowOutputBlock {
  predictions?: { predictions?: RoboflowPrediction[] } | RoboflowPrediction[];
}

const extraerPredicciones = (raw: unknown): RoboflowPrediction[] => {
  // Para el modelo Hosted API (detect.roboflow.com),
  // las predicciones vienen directamente en un arreglo en la raíz `raw.predictions`
  const root = raw as { predictions?: RoboflowPrediction[] };
  if (root?.predictions && Array.isArray(root.predictions)) {
    return root.predictions;
  }

  // Fallback a la lógica de workflows antigua
  const out: RoboflowPrediction[] = [];
  const rootWorkflows = raw as { outputs?: RoboflowOutputBlock[] };
  if (!rootWorkflows?.outputs) return out;

  for (const block of rootWorkflows.outputs) {
    const preds = block?.predictions;
    if (!preds) continue;
    if (Array.isArray(preds)) {
      out.push(...preds);
    } else if (Array.isArray(preds.predictions)) {
      out.push(...preds.predictions);
    }
  }
  return out;
};

export const detectarMaquinaria = async (
  fotografiaDataUrl: string,
): Promise<ResultadoDeteccion> => {
  const base64 = stripBase64Prefix(fotografiaDataUrl);

  const body = {
    imagen_base64: base64,
    classes: 'Excavator, Bull_dozer, Dumb_truck',
  };

  let res: Response;
  try {
    res = await fetch(DETECCION_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor de detección. Verifica tu conexión.');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`El servidor de detección respondió ${res.status}: ${text || 'error desconocido'}`);
  }

  const raw = await res.json();
  const preds = extraerPredicciones(raw);

  const detecciones: DeteccionMaquinaria[] = preds
    .filter((p): p is RoboflowPrediction & { class: string } => typeof p.class === 'string')
    .map((p) => ({
      clase: p.class,
      confianza: typeof p.confidence === 'number' ? p.confidence : 0,
      tipoInterno: ROBOFLOW_TO_TIPO[p.class] ?? 'OTRO',
    }))
    .sort((a, b) => b.confianza - a.confianza);

  return { detecciones, raw };
};
