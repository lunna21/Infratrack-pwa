/**
 * Servicio de detección de maquinaria con Roboflow.
 * Workflow: lunna-sosa/general-segmentation-api-5
 * Clases: Excavator, Bull_dozer, Dumb_truck
 */
import { ROBOFLOW_TO_TIPO, type TipoMaquinaria } from '../types';

const ROBOFLOW_API_URL = 'https://serverless.roboflow.com/infer/workflows/lunna-sosa/general-segmentation-api-5';
const API_KEY = import.meta.env.VITE_ROBOFLOW_API_KEY as string | undefined;

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
  // Estructura típica: { outputs: [ { predictions: { predictions: [...] } } ] }
  const out: RoboflowPrediction[] = [];
  const root = raw as { outputs?: RoboflowOutputBlock[] };
  if (!root?.outputs) return out;

  for (const block of root.outputs) {
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
  if (!API_KEY) {
    throw new Error('VITE_ROBOFLOW_API_KEY no está configurada.');
  }

  const base64 = stripBase64Prefix(fotografiaDataUrl);

  const body = {
    api_key: API_KEY,
    inputs: {
      image: { type: 'base64', value: base64 },
      classes: 'Excavator, Bull_dozer, Dumb_truck',
    },
    use_cache: true,
  };

  const res = await fetch(ROBOFLOW_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Roboflow respondió ${res.status}: ${text || 'error desconocido'}`);
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
