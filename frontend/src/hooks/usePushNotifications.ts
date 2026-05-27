import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const usePushNotifications = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          if (sub) {
            setIsSubscribed(true);
            setSubscription(sub);
          }
        });
      });
    }
  }, []);

  const subscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications are not supported in this browser.');
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notificaciones no permitidas.');
      }

      const reg = await navigator.serviceWorker.ready;
      
      // Request VAPID key from backend
      const keyResponse = await fetch(`${API_BASE_URL}/push/key`); 
      
      if (!keyResponse.ok) {
        throw new Error(`Error en el servidor al pedir VAPID key: ${keyResponse.status}`);
      }
      
      const keyText = await keyResponse.text();
      let publicKey: string;
      try {
        const keyJson = JSON.parse(keyText);
        publicKey = keyJson.publicKey || keyText;
      } catch (e) {
        publicKey = keyText;
      }

      if (!publicKey) throw new Error('No se obtuvo VAPID key.');

      const newSub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      // Guardar suscripción en el backend
      const subResponse = await fetch(`${API_BASE_URL}/push/subscriptions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newSub.toJSON())
      });

      if (!subResponse.ok) {
        throw new Error('Error guardando la suscripción en el servidor');
      }

      setSubscription(newSub);
      setIsSubscribed(true);
    } catch (err: any) {
      setError(err.message || 'Error al suscribirse');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!subscription) return;
      
      await subscription.unsubscribe();
      // Opcional: Avisar al backend para borrar la suscripción
      // await api.delete('/push/subscriptions', { endpoint: subscription.endpoint });

      setSubscription(null);
      setIsSubscribed(false);
    } catch (err: any) {
      setError(err.message || 'Error al cancelar suscripción');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { isSubscribed, subscribe, unsubscribe, error, loading };
};
