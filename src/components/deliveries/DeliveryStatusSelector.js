import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle, CheckCircle, Copy } from 'lucide-react';

const DeliveryStatusSelector = ({ ticketId, ticketNumber, currentStatus, deliveryData, onStatusChange }) => {
  const [status, setStatus] = useState(currentStatus || 'pending');
  const [timeLeft, setTimeLeft] = useState(null); // En segundos
  const [showTimer, setShowTimer] = useState(false);
  const [alertSounded, setAlertSounded] = useState(false);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  // Función para formatear tiempo MM:SS
  const formatTime = (seconds) => {
    if (seconds === null) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Configuración de estados
  const statusConfig = {
    pending: {
      label: 'Estado',
      color: 'bg-gray-200 dark:bg-gray-600',
      textColor: 'text-gray-600 dark:text-gray-400',
      icon: '⚪',
    },
    'solicitar-domi': {
      label: '🚨 Solicitar Domicilio',
      color: 'bg-yellow-300 dark:bg-yellow-600 animate-pulse',
      textColor: 'text-yellow-900 dark:text-yellow-100',
      icon: '🚨',
      message: 'me mandas un domicilio por favor, va para CLIENTEADDRESS',
    },
    entregado: {
      label: '✅ Entregado',
      color: 'bg-green-500 dark:bg-green-600',
      textColor: 'text-green-900 dark:text-green-100',
      icon: '✅',
      message: 'Hola CLIENTENAME tu pedido ya va en camino, que tengas muy buen provecho, te agradecemos por preferirnos, te esperamos pronto.\n\n📲 Síguenos en nuestras redes sociales y entérate de promociones, nuevos productos y contenido brutal 🔥🍔\n\nTikTok:\nhttps://www.tiktok.com/@roalburger?_r=1&_t=ZS-94kgEkN4aEH\n\nInstagram:\nhttps://www.instagram.com/roalburgerarmenia?igsh=cWE2eGRyNnlxaXgy&utm_source=qr\n\nFacebook:\nhttps://www.facebook.com/share/1B9MGGXh6h/?mibextid=wwXIfr\n\nROAL Burger\nComida rápida con acento venezolano 🇻🇪🔥',
    },
  };

  const currentConfig = statusConfig[status] || statusConfig.pending;

  // Función para jugar sonido de alerta
  const playAlertSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Sonido de alerta: 800Hz durante 500ms
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  // Copiar mensaje al portapapeles
  const copyToClipboard = (message) => {
    const processedMessage = message
      .replace('TICKETNUM', ticketNumber || 'N/A')
      .replace('CLIENTENAME', deliveryData?.name || 'Cliente')
      .replace('CLIENTEPHONE', deliveryData?.phone || 'N/A')
      .replace('CLIENTEADDRESS', deliveryData?.address || 'N/A');

    navigator.clipboard.writeText(processedMessage).then(() => {
      // Mostrar notificación temporal
      alert('✅ Mensaje copiado al portapapeles\n\nPuedes compartirlo por WhatsApp');
    });
  };

  // Manejar cambio de estado
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setTimeLeft(null);
    setShowTimer(false);
    setAlertSounded(false);

    // Si es "solicitar-domi", iniciar cronómetro a 20 minutos (1200 segundos)
    if (newStatus === 'solicitar-domi') {
      setTimeLeft(1200); // 20 minutos en segundos
      setShowTimer(true);
      // Copiar mensaje automáticamente
      setTimeout(() => {
        copyToClipboard(statusConfig['solicitar-domi'].message);
      }, 500);
    }
    // Si es "entregado", copiar mensaje y no iniciar cronómetro
    else if (newStatus === 'entregado') {
      setShowTimer(false);
      setTimeout(() => {
        copyToClipboard(statusConfig.entregado.message);
      }, 500);
    }

    // Notificar al padre
    if (onStatusChange) {
      onStatusChange(ticketId, newStatus);
    }
  };

  // Cronómetro
  useEffect(() => {
    if (!showTimer || timeLeft === null) return;

    if (timeLeft <= 0) {
      // Sonar alerta
      if (!alertSounded) {
        playAlertSound();
        setAlertSounded(true);
      }
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerRef.current);
  }, [timeLeft, showTimer, alertSounded]);

  return (
    <div className="flex flex-col gap-1 w-full">
      {/* Selector Principal */}
      <div className="relative w-full">
        <button
          onClick={() => {
            // Alternar desplegable
            const dropdown = document.getElementById(`dropdown-${ticketId}`);
            if (dropdown) {
              dropdown.classList.toggle('hidden');
            }
          }}
          className={`w-full px-2 py-1 rounded font-semibold text-xs flex items-center justify-between border border-transparent transition-all whitespace-nowrap ${currentConfig.color} ${currentConfig.textColor}`}
        >
          <span className="flex items-center gap-1 flex-shrink-0">
            {currentConfig.icon}
            <span className="hidden sm:inline">{currentConfig.label}</span>
          </span>
          {showTimer && timeLeft !== null && (
            <span className={`font-bold text-xs inline-flex items-center gap-1 ${timeLeft <= 60 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
              ⏱️ {formatTime(timeLeft)}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        <div
          id={`dropdown-${ticketId}`}
          className="hidden absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10"
        >
          <button
            onClick={() => {
              handleStatusChange('solicitar-domi');
              document.getElementById(`dropdown-${ticketId}`).classList.add('hidden');
            }}
            className="w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2 text-xs"
          >
            <span className="text-lg">🚨</span>
            <span className="font-medium text-gray-800 dark:text-white">Solicitar Domi</span>
          </button>

          <button
            onClick={() => {
              handleStatusChange('entregado');
              document.getElementById(`dropdown-${ticketId}`).classList.add('hidden');
            }}
            className="w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-xs"
          >
            <span className="text-lg">✅</span>
            <span className="font-medium text-gray-800 dark:text-white">Entregado</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryStatusSelector;
