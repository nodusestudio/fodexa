import React, { useState } from 'react';
import { Trash2, AlertTriangle, Loader } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';

export default function ClearOrdersPanel() {
  const { clearAllOrders } = useOrder();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleClearOrders = async () => {
    // Confirmación
    const confirmed = window.confirm(
      '⚠️ ¿LIMPIAR TODAS LAS ÓRDENES?\n\n' +
      '🗑️ Se eliminarán TODAS las órdenes del tablero\n' +
      '✅ Las funciones se mantienen activas\n\n' +
      '¿Continuar?'
    );

    if (!confirmed) return;

    setIsLoading(true);
    setResult(null);

    try {
      const success = await clearAllOrders();
      
      if (success) {
        setResult({
          type: 'success',
          message: '✅ Tablero limpiado exitosamente'
        });
        // Limpiar el mensaje después de 3 segundos
        setTimeout(() => setResult(null), 3000);
      } else {
        setResult({
          type: 'error',
          message: '❌ Error al limpiar el tablero'
        });
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: `❌ Error: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Warning Card */}
      <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
        <div className="flex gap-3">
          <AlertTriangle className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-200">Limpiar Tablero</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Esta acción eliminará TODAS las órdenes del sistema para que el tablero quede virgen. Las funciones se mantienen activas.
            </p>
          </div>
        </div>
      </div>

      {/* Clear Button */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          🗑️ Vaciar Tablero de Órdenes
        </h2>

        <button
          onClick={handleClearOrders}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 active:scale-95'
          }`}
        >
          {isLoading ? (
            <>
              <Loader size={20} className="animate-spin" />
              Limpiando...
            </>
          ) : (
            <>
              <Trash2 size={20} />
              LIMPIAR TABLERO AHORA
            </>
          )}
        </button>

        {/* Result Message */}
        {result && (
          <div className={`mt-4 p-3 rounded-lg text-center font-semibold ${
            result.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200'
          }`}>
            {result.message}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p>✂️ <strong>Se eliminarán:</strong> Todas las órdenes (mesas, para llevar, domicilios)</p>
          <p>✅ <strong>Se mantienen activos:</strong> Sistema POS, funciones, configuración</p>
          <p>🔄 <strong>Resultado:</strong> Tablero completamente vacío y listo para trabajar</p>
        </div>
      </div>
    </div>
  );
}
