import React, { useState, useEffect } from 'react';
import { Clock, Truck } from 'lucide-react';

const DeliveryTimer = ({ orderId, orderStatus, currentMinutes, currentSeconds, onContinuePreparing, onRequestDelivery }) => {
  const [isBlinking, setIsBlinking] = useState(false);

  // 🚚 Efecto para titilear cuando status es 'waiting'
  useEffect(() => {
    if (orderStatus === 'waiting') {
      const blinkInterval = setInterval(() => {
        setIsBlinking(prev => !prev);
      }, 500); // Titilear cada 500ms
      return () => clearInterval(blinkInterval);
    }
  }, [orderStatus]);

  const handleContinuePreparing = () => {
    onContinuePreparing && onContinuePreparing();
  };

  const handleRequestDelivery = () => {
    onRequestDelivery && onRequestDelivery();
  };

  const formattedTime = `${currentMinutes.toString().padStart(2, '0')}:${currentSeconds.toString().padStart(2, '0')}`;
  
  // 🚚 Texto y color según el estado
  const isWaiting = orderStatus === 'waiting';
  const headerText = isWaiting ? '🛵 ESPERANDO DOMI' : '🍳 EN PREPARACIÓN';
  const headerBgColor = isWaiting ? 'bg-blue-500' : 'bg-yellow-400';
  const headerBlinkClass = isWaiting && isBlinking ? 'opacity-70' : 'opacity-100';

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-md px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-4 overflow-hidden"
           style={{ borderColor: isWaiting ? '#3b82f6' : '#facc15' }}>
        
        {/* Header Parpadeante */}
        <div className={`${headerBgColor} text-gray-900 dark:text-white px-4 py-3 text-center transition-opacity ${headerBlinkClass}`}
             style={{ animationName: isWaiting ? 'pulse-blink' : 'pulse' }}>
          <p className="text-lg font-bold">{headerText}</p>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {/* Timer */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Clock size={32} className={`animate-pulse ${isWaiting ? 'text-blue-600' : 'text-blue-600'}`} />
              <span className="text-7xl font-bold font-mono"
                    style={{ color: isWaiting ? '#3b82f6' : '#2563eb' }}>
                {formattedTime}
              </span>
            </div>
            <p className="text-base text-gray-600 dark:text-gray-400 font-semibold">
              {isWaiting ? 'Tiempo en espera' : 'Tiempo para preparar'}
            </p>
          </div>

          {/* Botones - Solo mostrar si NO está en waiting */}
          {!isWaiting && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleContinuePreparing}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Clock size={20} />
                <span>Aún preparando</span>
              </button>
              <button
                onClick={handleRequestDelivery}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Truck size={20} />
                <span>Solicitar Domi</span>
              </button>
            </div>
          )}

          {/* Información */}
          {!isWaiting && (
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Aún preparando: reinicia a 5 minutos
            </p>
          )}

          {isWaiting && (
            <p className="text-xs text-center text-blue-600 dark:text-blue-400">
              Esperando la llegada del domiciliario...
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        @keyframes pulse-blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
        .animate-pulse {
          animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default DeliveryTimer;
