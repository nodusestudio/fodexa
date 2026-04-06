import React, { useState, useEffect } from 'react';
import { Clock, Truck } from 'lucide-react';

const DeliveryTimer = ({ orderId, onRequestDelivery }) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos = 600 segundos
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const handleContinuePreparing = () => {
    // Reiniciar a 5 minutos
    setTimeLeft(300);
    setIsRunning(true);
  };

  const handleRequestDelivery = () => {
    setIsRunning(false);
    onRequestDelivery && onRequestDelivery();
  };

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-yellow-400 overflow-hidden">
        {/* Header Parpadeante */}
        <div className="bg-yellow-400 text-gray-900 px-4 py-3 text-center animate-pulse">
          <p className="text-lg font-bold">🍳 EN PREPARACIÓN</p>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {/* Timer */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock size={24} className="text-blue-600" />
              <span className="text-5xl font-bold text-blue-600 font-mono">{formattedTime}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tiempo para preparar</p>
          </div>

          {/* Botones */}
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

          {/* Información */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Aún preparando: reinicia a 5 minutos
          </p>
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
        .animate-pulse {
          animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default DeliveryTimer;
