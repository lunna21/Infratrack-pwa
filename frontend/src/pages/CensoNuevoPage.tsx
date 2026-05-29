import { useEffect, useMemo, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { useNavigate } from "react-router-dom";
import { crearCensoApi, getMascotasApi, getPersonasApi } from "../services/api";
import type { Mascota, Persona, TipoMaquinaria } from "../types";
import { TIPO_MAQUINARIA_LABEL } from "../types";
import {
  detectarMaquinaria,
  type DeteccionMaquinaria,
} from "../services/roboflow";
import { FormSelect } from "../components/FormSelect";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import {
  LuCamera,
  LuMapPin,
  LuClock,
  LuRefreshCw,
  LuCheck,
  LuTriangleAlert,
  LuScan,
  LuCircleX,
} from "react-icons/lu";

const COLOR_DEFAULT = "#F97316";
const PROYECTO_DEFAULT = "FRENTE_001";

export const CensoNuevoPage = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [photoBytes, setPhotoBytes] = useState<number | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [facingMode] = useState<"user" | "environment">("environment");
  const [timestamp, setTimestamp] = useState<string>("");
  const [accuracy, setAccuracy] = useState<number | null>(null);

  // Roboflow
  const [analyzing, setAnalyzing] = useState(false);
  const [detecciones, setDetecciones] = useState<DeteccionMaquinaria[]>([]);
  const [topDeteccion, setTopDeteccion] = useState<DeteccionMaquinaria | null>(
    null,
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [form, setForm] = useState({
    idMascota: "",
    idDueno: "",
    lat: "",
    lon: "",
    fotografia: "",
  });

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  // ------- GPS
  const getCurrentPosition = () =>
    new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocalización no disponible"));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    });

  const captureCoordinates = async () => {
    const pos = await getCurrentPosition();
    setForm((c) => ({
      ...c,
      lat: pos.coords.latitude.toFixed(6),
      lon: pos.coords.longitude.toFixed(6),
    }));
    setAccuracy(pos.coords.accuracy);
    return pos.coords;
  };

  useEffect(() => {
    captureCoordinates().catch(() =>
      setError("No se pudo obtener la ubicación automáticamente."),
    );
  }, []);

  // ------- Datos backend
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [mas, per] = await Promise.all([
          getMascotasApi(),
          getPersonasApi(),
        ]);
        if (!alive) return;
        setMascotas(mas);
        setPersonas(per);
        setForm((c) => ({
          ...c,
          idMascota: c.idMascota || mas[0]?.id || "",
          idDueno: c.idDueno || per[0]?.id || "",
        }));
      } catch (err) {
        if (!alive) return;
        setError(
          err instanceof Error ? err.message : "No se pudieron cargar datos",
        );
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ------- Cámara
  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    },
    [],
  );

  // Adjunta el stream al <video> cuando este se monta (solo existe si cameraActive).
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {
        /* autoplay lo gestiona el atributo */
      });
    }
  }, [cameraActive]);

  const loadVideoDevices = async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const devices = await navigator.mediaDevices.enumerateDevices();
    const inputs = devices.filter((d) => d.kind === "videoinput");
    setVideoDevices(inputs);
    if (!selectedDeviceId && inputs.length > 0) {
      const back = inputs.find((d) =>
        /back|rear|environment|trasera/i.test(d.label),
      );
      setSelectedDeviceId((back ?? inputs[0]).deviceId);
    }
  };

  const traducirErrorCamara = (err: unknown): string => {
    if (!(err instanceof Error)) return "Cámara no disponible";
    switch (err.name) {
      case "NotReadableError":
      case "TrackStartError":
        return "La cámara está en uso por otra app o pestaña. Ciérrala e intenta de nuevo.";
      case "NotAllowedError":
      case "SecurityError":
        return "Permiso de cámara denegado. Habilítalo en los ajustes del navegador.";
      case "NotFoundError":
      case "DevicesNotFoundError":
        return "No se encontró ninguna cámara en este dispositivo.";
      case "OverconstrainedError":
        return "La cámara seleccionada no está disponible.";
      default:
        return `Cámara: ${err.message}`;
    }
  };

  const startCamera = async (deviceId?: string) => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraActive(false);
      setError(
        "Este navegador no permite acceso a la cámara. Usa HTTPS y un navegador compatible.",
      );
      return;
    }

    // Detén cualquier stream previo para liberar la cámara antes de reabrir.
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    // Intenta varias configuraciones, de la más específica a la más genérica.
    const intentos: MediaStreamConstraints[] = [];
    if (deviceId)
      intentos.push({ video: { deviceId: { exact: deviceId } }, audio: false });
    intentos.push({
      video: { facingMode: { ideal: facingMode } },
      audio: false,
    });
    intentos.push({ video: true, audio: false });

    let lastErr: unknown = null;
    for (const constraints of intentos) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {
            /* autoplay */
          });
        }
        setCameraActive(true);
        await loadVideoDevices();
        return;
      } catch (err) {
        lastErr = err;
        // Si es un problema de permisos o hardware ocupado, no tiene sentido reintentar.
        if (
          err instanceof Error &&
          (err.name === "NotAllowedError" || err.name === "NotReadableError")
        ) {
          break;
        }
      }
    }

    setCameraActive(false);
    setError(traducirErrorCamara(lastErr));
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  const dataUrlBytes = (dataUrl: string) => {
    const raw = dataUrl.split(",", 2)[1] ?? "";
    const padding = raw.endsWith("==") ? 2 : raw.endsWith("=") ? 1 : 0;
    return Math.floor((raw.length * 3) / 4) - padding;
  };

  const runRoboflow = async (dataUrl: string) => {
    setAnalyzing(true);
    setDetecciones([]);
    setTopDeteccion(null);
    try {
      const { detecciones: dets } = await detectarMaquinaria(dataUrl);
      setDetecciones(dets);
      const top = dets[0] ?? null;
      setTopDeteccion(top);

      // Auto-seleccionar maquinaria del backend si coincide tipo
      if (top) {
        const match = mascotas.find((m) => m.tipo === top.tipoInterno);
        if (match) setForm((c) => ({ ...c, idMascota: match.id }));
      }
    } catch (err) {
      console.warn("[v0] Roboflow error:", err);
      setError(
        err instanceof Error ? `Detección IA: ${err.message}` : "Error en IA",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      // Espera a que el video tenga datos y dimensiones reales antes de capturar.
      // Sin esto, videoWidth/videoHeight pueden ser 0 y toBlob devuelve null ("Sin imagen").
      if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(
            () =>
              reject(
                new Error("La cámara aún no está lista, intenta de nuevo"),
              ),
            3000,
          );
          const onReady = () => {
            if (video.videoWidth && video.videoHeight) {
              clearTimeout(timeout);
              video.removeEventListener("loadeddata", onReady);
              resolve();
            }
          };
          video.addEventListener("loadeddata", onReady);
          onReady();
        });
      }

      const width = video.videoWidth;
      const height = video.videoHeight;
      if (!width || !height) {
        throw new Error("La cámara no entregó imagen, intenta de nuevo");
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("No se pudo preparar el lienzo de captura");
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(video, 0, 0, width, height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Sin imagen"))),
          "image/jpeg",
          0.95,
        );
      });
      const file = new File([blob], "captura.jpg", { type: "image/jpeg" });

      const compressed = await imageCompression(file, {
        maxSizeMB: 0.05,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });
      const dataUrl = await imageCompression.getDataUrlFromFile(compressed);
      const bytes = dataUrlBytes(dataUrl);
      const maxBytes = 50 * 1024;

      if (bytes > maxBytes) {
        setError("La fotografía supera 50 KB. Vuelve a intentarlo.");
        return;
      }

      const ts = new Date().toISOString();
      setTimestamp(ts);
      set("fotografia", dataUrl);
      setPhotoBytes(bytes);
      stopCamera();

      // Refresca GPS al capturar
      try {
        await captureCoordinates();
      } catch {
        /* ignore */
      }

      // Lanza IA
      void runRoboflow(dataUrl);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Compresión: ${err.message}`
          : "Error en captura",
      );
    }
  };

  const mascotaOptions = useMemo(
    () => [
      { value: "", label: "Selecciona maquinaria…" },
      ...mascotas.map((m) => ({
        value: m.id,
        label: `${m.nombre} · ${TIPO_MAQUINARIA_LABEL[m.tipo as TipoMaquinaria] ?? m.tipo}`,
      })),
    ],
    [mascotas],
  );

  const duenoOptions = useMemo(
    () => [
      { value: "", label: "Selecciona operador/responsable…" },
      ...personas.map((p) => ({
        value: p.id,
        label: `${p.nombres} ${p.apellidos}`.trim(),
      })),
    ],
    [personas],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.fotografia) return setError("Toma una fotografía con la cámara.");
    if (!form.idMascota || !form.idDueno)
      return setError("Selecciona maquinaria y responsable.");

    setLoading(true);
    try {
      let lat = Number(form.lat);
      let lon = Number(form.lon);
      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        const c = await captureCoordinates();
        lat = c.latitude;
        lon = c.longitude;
      }
      await crearCensoApi({
        idMascota: form.idMascota,
        idDueno: form.idDueno,
        fotografia: form.fotografia,
        lat,
        lon,
        idProyecto: PROYECTO_DEFAULT,
        color: COLOR_DEFAULT,
      });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo registrar la captura",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 pt-20">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 text-center max-w-sm w-full animate-slide-up">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-6">
              <LuCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Captura registrada
            </h2>
            <p className="text-slate-500 font-medium mt-3 text-sm">
              Volviendo al panel...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12 w-full animate-fade-in">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 mb-2 px-2.5 py-1 rounded-md bg-brand-primary text-white text-[10px] font-bold uppercase tracking-[0.18em]">
              <LuCamera className="w-3 h-3" /> Captura de campo
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Reporte de avance —{" "}
              <span className="text-brand-secondary">
                frente {PROYECTO_DEFAULT}
              </span>
            </h1>
            <p className="text-slate-500 font-medium mt-2 max-w-xl">
              Foto + GPS + timestamp con detección automática de maquinaria
              mediante IA.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Cancelar
          </Button>
        </header>

        {error && (
          <div className="mt-6 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
            <LuTriangleAlert className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6"
        >
          {/* Cámara / preview */}
          <section className="lg:col-span-3 corp-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <LuCamera className="w-4 h-4 text-brand-primary" />
                Evidencia fotográfica
              </h2>
              {form.fotografia && photoBytes && (
                <span className="text-xs font-mono text-slate-500">
                  {(photoBytes / 1024).toFixed(1)} KB
                </span>
              )}
            </div>

            <div className="p-5">
              {!form.fotografia && !cameraActive && (
                <div className="aspect-video w-full rounded-xl bg-slate-900 border border-slate-200 flex flex-col items-center justify-center gap-4 text-white">
                  <LuCamera className="w-10 h-10 opacity-60" />
                  <p className="text-sm font-semibold opacity-90">
                    Activa la cámara para capturar
                  </p>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => startCamera(selectedDeviceId || undefined)}
                  >
                    Activar cámara
                  </Button>
                  {videoDevices.length > 1 && (
                    <div className="w-full max-w-xs px-4">
                      <FormSelect
                        label="Cámara"
                        value={selectedDeviceId}
                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                        options={videoDevices.map((d) => ({
                          value: d.deviceId,
                          label: d.label || "Cámara",
                        }))}
                        labelClassName="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1"
                        selectClassName="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {cameraActive && (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />{" "}
                      En vivo
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-mono">
                      <span className="px-2 py-1 rounded bg-black/50 backdrop-blur">
                        {form.lat && form.lon
                          ? `${form.lat}, ${form.lon}`
                          : "GPS…"}
                      </span>
                      <span className="px-2 py-1 rounded bg-black/50 backdrop-blur">
                        {new Date().toLocaleTimeString("es-CO")}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      fullWidth
                      onClick={capturePhoto}
                    >
                      <LuCamera className="w-4 h-4 mr-2" /> Capturar foto
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={stopCamera}
                    >
                      <LuCircleX className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {form.fotografia && (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={form.fotografia || "/placeholder.svg"}
                      alt="Captura de campo"
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
                      <LuCheck className="w-3 h-3" /> Capturado
                    </div>
                    {timestamp && (
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-mono">
                        <span className="px-2 py-1 rounded bg-black/60 backdrop-blur flex items-center gap-1.5">
                          <LuMapPin className="w-3 h-3" /> {form.lat},{" "}
                          {form.lon}
                        </span>
                        <span className="px-2 py-1 rounded bg-black/60 backdrop-blur flex items-center gap-1.5">
                          <LuClock className="w-3 h-3" />{" "}
                          {new Date(timestamp).toLocaleTimeString("es-CO")}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        set("fotografia", "");
                        setPhotoBytes(null);
                        setDetecciones([]);
                        setTopDeteccion(null);
                      }}
                    >
                      <LuRefreshCw className="w-4 h-4 mr-2" /> Tomar otra
                    </Button>
                  </div>
                </div>
              )}

              {/* Resultado IA */}
              {form.fotografia && (
                <div className="mt-5 p-4 rounded-xl bg-slate-900 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <LuScan
                        className={`w-4 h-4 ${analyzing ? "animate-pulse text-brand-primary" : "text-brand-primary"}`}
                      />
                      Detección IA — Roboflow
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {analyzing
                        ? "Analizando…"
                        : `${detecciones.length} resultado(s)`}
                    </span>
                  </div>

                  {analyzing && (
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-brand-primary animate-pulse rounded-full" />
                    </div>
                  )}

                  {!analyzing && topDeteccion && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 border border-slate-700 mb-2">
                      <div className="w-10 h-10 rounded-md bg-emerald-500 text-white flex items-center justify-center">
                        <LuCheck className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-emerald-400">
                          Sugerencia automática
                        </p>
                        <p className="text-[11px] font-mono text-slate-300">
                          Detectado:{" "}
                          {TIPO_MAQUINARIA_LABEL[topDeteccion.tipoInterno]} ·
                          confianza {(topDeteccion.confianza * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black font-mono text-emerald-500">
                          {(topDeteccion.confianza * 100).toFixed(0)}
                          <span className="text-sm">%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!analyzing && detecciones.length === 0 && (
                    <p className="text-xs text-slate-400 font-medium">
                      No se detectó maquinaria. Selecciona el equipo
                      manualmente.
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Form lateral */}
          <section className="lg:col-span-2 space-y-5">
            {/* Metadata GPS */}
            <div className="corp-card p-5">
              <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                <LuMapPin className="w-4 h-4 text-brand-primary" />{" "}
                Geolocalización
              </h2>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Latitud
                  </p>
                  <p className="font-mono text-sm font-bold text-slate-900">
                    {form.lat || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Longitud
                  </p>
                  <p className="font-mono text-sm font-bold text-slate-900">
                    {form.lon || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  Precisión:{" "}
                  <span className="font-mono font-bold text-slate-700">
                    {accuracy ? `${accuracy.toFixed(0)} m` : "—"}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    captureCoordinates().catch(() =>
                      setError("GPS no disponible"),
                    )
                  }
                  className="inline-flex items-center gap-1 text-brand-primary font-bold hover:text-brand-hover"
                >
                  <LuRefreshCw className="w-3 h-3" /> Actualizar
                </button>
              </div>
            </div>

            {/* Asociaciones */}
            <div className="corp-card p-5 space-y-4">
              <h2 className="font-bold text-slate-900">
                Detalles del registro
              </h2>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Maquinaria *
                </label>
                <FormSelect
                  label=""
                  required
                  value={form.idMascota}
                  onChange={(e) => set("idMascota", e.target.value)}
                  options={mascotaOptions}
                  labelClassName="hidden"
                  selectClassName="login-input"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Operador / responsable *
                </label>
                <FormSelect
                  label=""
                  required
                  value={form.idDueno}
                  onChange={(e) => set("idDueno", e.target.value)}
                  options={duenoOptions}
                  labelClassName="hidden"
                  selectClassName="login-input"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Frente
                  </p>
                  <p className="font-mono font-bold text-slate-900">
                    {PROYECTO_DEFAULT}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Capturado por
                  </p>
                  <p className="font-bold text-slate-900 truncate">
                    {usuario || "—"}
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading || !form.fotografia}
              isLoading={loading}
            >
              Registrar captura en obra
            </Button>
          </section>
        </form>
      </main>
    </div>
  );
};
