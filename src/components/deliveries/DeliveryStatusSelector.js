import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle, CheckCircle, Copy } from 'lucide-react';

const DeliveryStatusSelector = ({ ticketId, currentStatus, deliveryData, onStatusChange }) => {
  const [status, setStatus] = useState(currentStatus || 'pending');
  const [timeLeft, setTimeLeft] = useState(null);
  const [showTimer, setShowTimer] = useState(false);
  const [alertSounded, setAlertSounded] = useState(false);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

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
      message: '📲 *SOLICITUD DE DOMICILIARIO PENDIENTE* 📲\n\nPedido #TICKETNUM\nCliente: CLIENTENAME\nTelefono: CLIENTEPHONE\nDirección: CLIENTEADDRESS\n\n⏰ *¡SE REQUIERE DOMICILIARIO URGENTE!*\n\nContactar al domiciliario más cercano.',
    },
    entregado: {
      label: '✅ Entregado',
      color: 'bg-green-500 dark:bg-green-600',
      textColor: 'text-green-900 dark:text-green-100',
      icon: '✅',
      message: '✅ *PEDIDO ENTREGADO* ✅\n\nPedido #TICKETNUM\nCliente: CLIENTENAME\nTelefono: CLIENTEPHONE\nDirección: CLIENTEADDRESS\n\n✏️ *Entregado correctamente*\n\nGracias por tu compra 🙏',
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
      .replace('TICKETNUM', ticketId || 'N/A')
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

    // Si es "solicitar-domi", iniciar cronómetro a 20 segundos
    if (newStatus === 'solicitar-domi') {
      setTimeLeft(20);
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
    <div className="flex flex-col gap-2 w-full">
      {/* Selector Principal */}
      <div className="relative">
        <button
          onClick={() => {
            // Alternar desplegable
            const dropdown = document.getElementById(`dropdown-${ticketId}`);
            if (dropdown) {
              dropdown.classList.toggle('hidden');
            }
          }}
          className={`w-full px-3 py-2 rounded-lg font-medium text-sm flex items-center justify-between border-2 border-transparent transition-all ${currentConfig.color} ${currentConfig.textColor}`}
        >
          <span className="flex items-center gap-2">
            {currentConfig.icon}
            {currentConfig.label}
          </span>
          {showTimer && timeLeft !== null && (
            <span className={`font-bold text-lg ${timeLeft <= 5 ? 'text-red-600 animate-pulse' : ''}`}>
              ⏱️ {timeLeft}s
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        <div
          id={`dropdown-${ticketId}`}
          className="hidden absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
        >
          <button
            onClick={() => {
              handleStatusChange('solicitar-domi');
              document.getElementById(`dropdown-${ticketId}`).classList.add('hidden');
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2"
          >
            <span className="text-lg">🚨</span>
            <span className="font-medium text-gray-800 dark:text-white">Solicitar Domicilio</span>
          </button>

          <button
            onClick={() => {
              handleStatusChange('entregado');
              document.getElementById(`dropdown-${ticketId}`).classList.add('hidden');
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <span className="text-lg">✅</span>
            <span className="font-medium text-gray-800 dark:text-white">Entregado</span>
          </button>
        </div>
      </div>

      {/* Indicador de Alerta */}
      {showTimer && timeLeft !== null && timeLeft <= 0 && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-2 flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-red-700 dark:text-red-300">
            ⏰ Domicilio DEMORADO - Tiempo agotado
          </span>
        </div>
      )}
    </div>
  );
};

export default DeliveryStatusSelector;
