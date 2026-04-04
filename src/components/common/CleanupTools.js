import React, { useState } from 'react';
import { AlertCircle, Trash2, RefreshCw } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';

/**
 * Herramienta de mantenimiento para limpiar órdenes "fantasma"
 * Accesible desde Settings o como debug tool
 */
const CleanupTools = () => {
  const { cleanupGhostOrders, orders } = useOrder();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleCleanup = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      console.log('🧹 Iniciando limpieza de órdenes fantasma...');
      await cleanupGhostOrders();
      
      setMessageType('success');
      setMessage('✅ Limpieza completada. Las órdenes completadas fueron eliminadas.');
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('❌ Error en limpieza:', error);
      setMessageType('error');
      setMessage(`❌ Error: ${error.message}`);
      
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = orders.filter(o => o.status === 'completed').length;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 md:p-6 space-y-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" size={20} />
        <div className="flex-1">
          <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
            🧹 Herramientas de Limpieza
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
            Limpia órdenes completadas que pueden estar bloqueando mesas (como Mesa #7).
          </p>
          
          {completedCount > 0 && (
            <div className="mb-3 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                ⚠️ Hay <strong>{completedCount} órdenes completadas</strong> que pueden limpiarse.
              </p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleCleanup}
        disabled={loading || completedCount === 0}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-colors ${
          loading || completedCount === 0
            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
        }`}
      >
        {loading ? (
          <>
            <RefreshCw size={18} className="animate-spin" />
            Limpiando...
          </>
        ) : (
          <>
            <Trash2 size={18} />
            Limpiar Órdenes Completadas ({completedCount})
          </>
        )}
      </button>

      {message && (
        <div className={`p-3 rounded-lg text-sm font-medium ${
          messageType === 'success'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700'
            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default CleanupTools;
