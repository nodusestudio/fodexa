import React, { useState, useEffect } from 'react';
import { Clock, Truck } from 'lucide-react';

const DeliveryTimer = ({ orderId, currentMinutes, currentSeconds, onContinuePreparing, onRequestDelivery }) => {
  const handleContinuePreparing = () => {
    // Enviar callback al OrderCard para resetear el timer
    onContinuePreparing && onContinuePreparing();
  };

  const handleRequestDelivery = () => {
    onRequestDelivery && onRequestDelivery();
  };

  const formattedTime = `${currentMinutes.toString().padStart(2, '0')}:${currentSeconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-md px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-4 border-yellow-400 overflow-hidden">
        {/* Header Parpadeante */}
        <div className="bg-yellow-400 text-gray-900 px-4 py-3 text-center animate-pulse">
          <p className="text-lg font-bold">🍳 EN PREPARACIÓN</p>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {/* Timer */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Clock size={32} className="text-blue-600 animate-pulse" />
              <span className="text-7xl font-bold text-blue-600 font-mono">{formattedTime}</span>
            </div>
            <p className="text-base text-gray-600 dark:text-gray-400 font-semibold">Tiempo para preparar</p>
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
