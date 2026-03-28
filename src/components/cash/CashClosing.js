import React, { useState } from 'react';
import { useCash } from '../../context/CashContext';
import { Lock, X } from 'lucide-react';

const CashClosing = ({ onClose }) => {
  const { cashSession, closeCash, calculateExpectedAmount } = useCash();
  const [finalCount, setFinalCount] = useState('');
  const [observations, setObservations] = useState('');

  const expectedAmount = calculateExpectedAmount();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!finalCount || parseFloat(finalCount) < 0) {
      alert('⚠️ Ingresa un conteo final válido');
      return;
    }

    const closedSession = closeCash(finalCount, observations);
    
    // Disparar evento para mostrar el ticket de cierre
    if (closedSession && closedSession.id) {
      console.log('💾 Sesión cerrada, ID:', closedSession.id);
      window.dispatchEvent(new CustomEvent('cashClosed', { detail: { sessionId: closedSession.id } }));
    }
    
    onClose();
  };

  const difference = finalCount ? (parseFloat(finalCount) - expectedAmount) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Lock size={28} className="text-orange-600 dark:text-orange-400" />
            Cierre de Caja
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Info de sesión */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Apertura:</span>
              <span className="font-medium text-gray-800 dark:text-white">
                {new Date(cashSession?.openDate).toLocaleString('es-CO')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Monto Inicial:</span>
              <span className="font-medium text-gray-800 dark:text-white">
                ${cashSession?.initialAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Monto Esperado */}
          <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                💰 Monto Esperado:
              </span>
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                ${expectedAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Conteo Final */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📊 Conteo Físico del Día *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={finalCount}
              onChange={(e) => setFinalCount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 text-lg"
              placeholder="0.00"
            />
          </div>

          {/* Diferencia */}
          {finalCount && (
            <div className={`rounded-lg p-4 ${
              difference === 0 
                ? 'bg-green-50 dark:bg-green-900 dark:bg-opacity-20' 
                : difference > 0
                ? 'bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20'
                : 'bg-red-50 dark:bg-red-900 dark:bg-opacity-20'
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">
                  {difference === 0 ? '✅ Cuadre Perfecto' : difference > 0 ? '⚠️ Sobrante' : '❌ Faltante'}
                </span>
                <span className={`text-2xl font-bold ${
                  difference === 0 ? 'text-green-600 dark:text-green-400' :
                  difference > 0 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {difference >= 0 ? '+' : ''}${difference.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observaciones del Cierre
            </label>
            <textarea
              rows="3"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500"
              placeholder="Ej: Todo cuadra correctamente..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
            >
              🔒 Cerrar Caja
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashClosing;
