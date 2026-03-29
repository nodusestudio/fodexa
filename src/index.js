import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { CartProvider } from './context/CartContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </React.StrictMode>
);

// Registrar Service Worker para PWA (instalable en devices)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado exitosamente:', registration);
      })
      .catch((error) => {
        console.log('❌ Error registrando Service Worker:', error);
      });
  });
}

// Detectar cuando la app está lista para ser instalada
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('📱 App lista para ser instalada');
});

// Manejar clic en "Instalar" (si agregas botón en UI)
window.addEventListener('appinstalled', () => {
  console.log('✨ App instalada exitosamente');
  deferredPrompt = null;
});
