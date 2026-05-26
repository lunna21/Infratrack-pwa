import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { initOfflineQueue } from './pwa/offlineQueue'

// registerSW({
//   immediate: true,
// });

// initOfflineQueue();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registrado con éxito, scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Error al registrar el SW:', error);
      });
  });
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
