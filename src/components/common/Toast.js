import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', duration = 2000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const colors = {
    success: 'bg-green-100 border-green-400 text-green-800',
    error: 'bg-red-100 border-red-400 text-red-800',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
    info: 'bg-blue-100 border-blue-400 text-blue-800'
  };

  const icons = {
    success: <CheckCircle className="text-green-600" size={24} />,
    error: <AlertCircle className="text-red-600" size={24} />,
    warning: <AlertCircle className="text-yellow-600" size={24} />,
    info: <Info className="text-blue-600" size={24} />
  };

  return (
    <div className={`fixed top-4 right-4 z-50 border-l-4 rounded-lg shadow-lg p-4 flex items-center gap-3 ${colors[type]} max-w-md animate-slide-in`}>
      {icons[type]}
      <span className="flex-1 font-medium">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose && onClose();
        }}
        className="text-gray-500 hover:text-gray-700 flex-shrink-0"
      >
        <X size={18} />
      </button>
      
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Toast;
