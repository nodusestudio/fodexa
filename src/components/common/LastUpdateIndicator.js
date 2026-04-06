import React, { useState, useEffect } from 'react';
import { RotateCw } from 'lucide-react';

const LastUpdateIndicator = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Escuchar para cambios de órdenes
    const handleOrderChange = () => {
      setLastUpdate(new Date());
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    };

    // Escuchar múltiples tipos de eventos
    window.addEventListener('orderSaved', handleOrderChange);
    window.addEventListener('orderUpdated', handleOrderChange);
    window.addEventListener('orderCreated', handleOrderChange);
    window.addEventListener('push-message', handleOrderChange);

    return () => {
      window.removeEventListener('orderSaved', handleOrderChange);
      window.removeEventListener('orderUpdated', handleOrderChange);
      window.removeEventListener('orderCreated', handleOrderChange);
      window.removeEventListener('push-message', handleOrderChange);
    };
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className={`fixed top-5 right-5 z-40 transition-all duration-300 ${
      isAnimating ? 'scale-110' : 'scale-100'
    }`}>
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex flex-col items-center justify-center">
          <RotateCw 
            size={18} 
            className={`text-white mb-0.5 ${isAnimating ? 'animate-spin' : ''}`}
            style={{
              animationDuration: '0.6s'
            }}
          />
          <span className="text-white text-xs font-bold text-center leading-none">
            {formatTime(lastUpdate).split(':').slice(0, 2).join(':')}
          </span>
        </div>
      </div>
      
      {/* Tooltip */}
      <div className="absolute top-20 right-0 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
        Última actualización: {formatTime(lastUpdate)}
      </div>
    </div>
  );
};

export default LastUpdateIndicator;
