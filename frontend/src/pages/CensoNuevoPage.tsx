import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearCensoApi, getMascotasApi, getPersonasApi } from "../services/api";
import type { Mascota, Persona } from "../types";
import { FormInput } from "../components/FormInput";
import { FormSelect } from "../components/FormSelect";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/Button";
import { AnimalFootPrint } from "../components/AnimalFootPrint";

const COLOR_DEFAULT = "#B0F0FF";
const PROYECTO_DEFAULT = "PROPWA_004";

export const CensoNuevoPage = () => {
  const navigate = useNavigate();
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode] = useState<"user" | "environment">("user");
  const [photoBytes, setPhotoBytes] = useState<number | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
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

  useEffect(() => {
    let alive = true;

    const loadData = async () => {
      try {
        const [mascotasData, personasData] = await Promise.all([
          getMascotasApi(),
          getPersonasApi(),
        ]);
        if (!alive) return;
        setMascotas(mascotasData);
        setPersonas(personasData);
        setForm((current) => ({
          ...current,
          idMascota: current.idMascota || mascotasData[0]?.id || "",
          idDueno: current.idDueno || personasData[0]?.id || "",
        }));
      } catch (err: unknown) {
        if (!alive) return;
        setError(
          err instanceof Error ? err.message : "No se pudieron cargar datos",
        );
      }
    };

    void loadData();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const checkPermission = async () => {
      if (!("permissions" in navigator)) return;

      try {
        const status = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });
        if (status.state === "granted") {
          setCameraReady(true);
          void startCamera(facingMode);
        }
      } catch {
        // Ignorar si el navegador no soporta este permiso
      }
    };

    void checkPermission();
  }, [facingMode]);

  const dataUrlBytes = (dataUrl: string): number => {
    const raw = dataUrl.split(",", 2)[1] ?? "";
    const padding = raw.endsWith("==") ? 2 : raw.endsWith("=") ? 1 : 0;
    return Math.floor((raw.length * 3) / 4) - padding;
  };

  const loadVideoDevices = async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter(
      (device) => device.kind === "videoinput",
    );
    setVideoDevices(videoInputs);
    if (!selectedDeviceId && videoInputs.length > 0) {
      const preferred = videoInputs.find((device) =>
        /front|user|frontal/i.test(device.label),
      );
      setSelectedDeviceId((preferred ?? videoInputs[0]).deviceId);
    }
  };

  const startCamera = async (
    mode: "user" | "environment",
    deviceId?: string,
  ) => {
    try {
      setError("");
      if ("permissions" in navigator) {
        try {
          const status = await navigator.permissions.query({
            name: "camera" as PermissionName,
          });
          if (status.state === "denied") {
            setCameraActive(false);
            setError("Permiso de cámara denegado. Habilitalo en el navegador.");
            return;
          }
        } catch {
          // Ignorar si el navegador no soporta este permiso
        }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: mode },
        audio: false,
      });
      setCameraReady(true);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      await loadVideoDevices();
    } catch (err: unknown) {
      setCameraActive(false);
      setError(
        err instanceof Error
          ? `No se pudo acceder a la cámara: ${err.message}`
          : "No se pudo acceder a la cámara",
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;

    const maxBytes = 50 * 1024;
    const baseWidth = video.videoWidth;
    const baseHeight = video.videoHeight;

    let scale = 1;
    let quality = 0.85;
    let dataUrl = "";
    let bytes = 0;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const width = Math.max(1, Math.floor(baseWidth * scale));
      const height = Math.max(1, Math.floor(baseHeight * scale));
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);
      dataUrl = canvas.toDataURL("image/jpeg", quality);
      bytes = dataUrlBytes(dataUrl);

      if (bytes <= maxBytes) break;
      if (quality > 0.5) {
        quality -= 0.1;
      } else {
        scale *= 0.9;
      }
    }

    if (bytes > maxBytes) {
      setError(
        "La fotografia supera 50 KB. Acerca la cámara o intenta de nuevo.",
      );
      return;
    }

    set("fotografia", dataUrl);
    setPhotoBytes(bytes);
    stopCamera();
  };

  const mascotaOptions = useMemo(
    () => [
      { value: "", label: "Selecciona una mascota" },
      ...mascotas.map((m) => ({
        value: m.id,
        label: `${m.nombre} (${m.tipo})`,
      })),
    ],
    [mascotas],
  );

  const duenoOptions = useMemo(
    () => [
      { value: "", label: "Selecciona un dueño" },
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

    if (!form.fotografia) {
      setError("Debes tomar una fotografia con la cámara");
      return;
    }

    const latNumber = Number(form.lat);
    const lonNumber = Number(form.lon);
    if (Number.isNaN(latNumber) || Number.isNaN(lonNumber)) {
      setError("Latitud y longitud deben ser numeros validos");
      return;
    }

    if (!form.idMascota || !form.idDueno) {
      setError("Debes seleccionar una mascota y un dueño");
      return;
    }

    setLoading(true);
    try {
      await crearCensoApi({
        idMascota: form.idMascota,
        idDueno: form.idDueno,
        fotografia: form.fotografia || "",
        lat: latNumber,
        lon: lonNumber,
        idProyecto: PROYECTO_DEFAULT,
        color: COLOR_DEFAULT,
      });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al registrar censo");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-wrapper relative flex flex-col">
        {/* Elementos decorativos */}
        <div className="absolute top-[20%] right-[-5%] w-72 h-72 bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
        <AnimalFootPrint className="absolute inset-0 w-full h-full z-0 opacity-30 pointer-events-none" />
        <Navbar />

        <main className="flex-1 flex items-center justify-center p-4 relative z-10 w-full">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-10 text-center max-w-sm w-full border border-white/50 animate-slide-up">
            <div className="text-6xl mb-6 bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-green-500 shadow-inner">
              📋
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Censo registrado
            </h2>
            <p className="text-slate-500 font-medium mt-3">
              Volviendo al panel...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="login-wrapper relative flex flex-col">
      {/* Elementos decorativos */}
      <div className="absolute top-[20%] right-[-5%] w-72 h-72 bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
      <AnimalFootPrint className="absolute inset-0 w-full h-full z-0 opacity-30 pointer-events-none" />

      <div
        className="absolute bottom-[10%] left-[-10%] w-96 h-96 bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"
        style={{ animationDelay: "1.5s" }}
      ></div>

      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 relative z-10 w-full">
        <div className="w-full max-w-xl relative z-10 animate-slide-up">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-extrabold mt-16 text-slate-800 tracking-tight">
              Nuevo censo
            </h1>
            <p className="text-brand-primary mt-1 font-semibold">
              Asocia mascota y dueño existentes
            </p>
          </div>

          <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-100/50 border border-white/60 p-8 sm:p-10">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50/80 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
              <FormSelect
                label="Mascota"
                required
                value={form.idMascota}
                onChange={(e) => set("idMascota", e.target.value)}
                options={mascotaOptions}
              />

              <FormSelect
                label="Dueño"
                required
                value={form.idDueno}
                onChange={(e) => set("idDueno", e.target.value)}
                options={duenoOptions}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="Latitud"
                  required
                  type="number"
                  step="0.000001"
                  value={form.lat}
                  onChange={(e) => set("lat", e.target.value)}
                  placeholder="5.5343"
                />
                <FormInput
                  label="Longitud"
                  required
                  type="number"
                  step="0.000001"
                  value={form.lon}
                  onChange={(e) => set("lon", e.target.value)}
                  placeholder="-73.3678"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700">
                  Fotografía *
                </label>

                {!form.fotografia && (
                  <div className="rounded-lg border border-gray-200 p-3">
                    <div className="flex flex-wrap gap-2">
                      {!cameraActive && (
                        <Button
                          type="button"
                          variant="primary"
                          onClick={() =>
                            startCamera(
                              facingMode,
                              selectedDeviceId || undefined,
                            )
                          }
                        >
                          Activar cámara
                        </Button>
                      )}
                      {videoDevices.length > 1 && (
                        <FormSelect
                          label="Camara"
                          value={selectedDeviceId}
                          onChange={(e) => {
                            const nextId = e.target.value;
                            setSelectedDeviceId(nextId);
                            if (cameraActive) {
                              void startCamera(facingMode, nextId);
                            }
                          }}
                          options={videoDevices.map((device) => ({
                            value: device.deviceId,
                            label: device.label || "Camara",
                          }))}
                          labelClassName="block text-xs font-medium text-gray-700"
                          selectClassName="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>

                    {!cameraActive && (
                      <p className="text-xs text-gray-500 mt-2">
                        {cameraReady
                          ? "La cámara ya fue autorizada. Activa para previsualizar."
                          : "Se solicitará permiso de cámara si aún no esta autorizado."}
                      </p>
                    )}

                    {cameraActive && (
                      <div className="mt-3 space-y-2">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full rounded-lg border border-gray-200"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="primary"
                            onClick={capturePhoto}
                          >
                            Tomar foto
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={stopCamera}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {form.fotografia && (
                  <div className="rounded-lg border border-gray-200 p-3 space-y-2">
                    <img
                      src={form.fotografia}
                      alt="Fotografía capturada"
                      className="w-full rounded-lg border border-gray-200"
                    />
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Tamano:{" "}
                        {photoBytes
                          ? `${(photoBytes / 1024).toFixed(1)} KB`
                          : "N/A"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          set("fotografia", "");
                          setPhotoBytes(null);
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Tomar otra
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  fullWidth
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  fullWidth
                >
                  {loading ? "Guardando..." : "Registrar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
