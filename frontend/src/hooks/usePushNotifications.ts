import { useState } from "react";
import { API_BASE_URL } from "../config";

const API_BASE = API_BASE_URL;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function usePushNotifications() {
  const [estado, setEstado] = useState("idle"); // idle | cargando | ok | error

  const suscribir = async () => {
    setEstado("cargando");
    try {
      const token = localStorage.getItem("jwt_token");
      if (!token) {
        throw new Error("No hay token JWT. Haz login primero.");
      }

      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("Este navegador no soporta Service Worker o Push API.");
      }

      console.log("solicitando permiso de notificaciones...");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Permiso de notificaciones no concedido.");
      }

      console.log("registrando service worker...");
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const keyResponse = await fetch(`${API_BASE}/push/key`);
      if (!keyResponse.ok) {
        const text = await keyResponse.text();
        throw new Error(
          `No se obtuvo VAPID key (${keyResponse.status}): ${text}`,
        );
      }

      const { publicKey } = await keyResponse.json();
      if (!publicKey) {
        throw new Error("Respuesta inválida de /push/key");
      }

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        console.log("creando suscripción push...");
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      console.log("enviando suscripción al backend...");
      const saveResponse = await fetch(`${API_BASE}/push/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subscription),
      });

      if (saveResponse.status !== 204) {
        const text = await saveResponse.text();
        throw new Error(
          `No se guardó suscripción (${saveResponse.status}): ${text}`,
        );
      }
      console.log(
        "suscripción push registrada. Ahora crea un censo desde Postman.",
      );
      setEstado("ok");
    } catch (err) {
      setEstado("error");
    }
  };

  return { suscribir, estado };
}
