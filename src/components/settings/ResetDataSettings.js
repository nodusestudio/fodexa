import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { AlertTriangle, Loader } from 'lucide-react';

export default function ResetDataSettings() {
  const { resetUserData } = useSettings();
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    const confirmed = window.confirm(
      '⚠️ ¿Estás seguro de que quieres eliminar todos los datos ficticios?\n\n' +
      'Se eliminarán:\n' +
      '✅ Órdenes y Domicilios\n' +
      '✅ Tickets\n' +
      '✅ Caja y Gastos\n' +
      '✅ Reportes\n' +
      '✅ Libro Contable\n\n' +
      '❌ NO se borrará: Clientes ni Artículos\n\n' +
      'Esta acción NO se puede deshacer.'
    );

    if (confirmed) {
      setIsLoading(true);
      const success = await resetUserData();
      setIsLoading(false);
      
      if (success) {
        // Recargar página después del reset exitoso
        setTimeout(() => window.location.reload(), 2000);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Warning Card */}
      <div className="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 p-4 rounded">
        <div className="flex gap-3">
          <AlertTriangle className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-200">Área Peligrosa</h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Esta sección permite eliminar datos ficticios de ejemplo para limpiar el sistema y empezar de cero.
            </p>
          </div>
        </div>
      </div>

      {/* Reset Data Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          🗑️ Limpiar Datos Ficticios
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Elimina todos los datos de ejemplo que fueron cargados para pruebas. 
          <br />
          <strong>Tus clientes y artículos se preservarán.</strong>
        </p>

        <div className="space-y-2 mb-6 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">✂️</span>
            <span className="text-gray-700 dark:text-gray-300">Órdenes y Domicilios</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">✂️</span>
            <span className="text-gray-700 dark:text-gray-300">Tickets de Venta</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">✂️</span>
            <span className="text-gray-700 dark:text-gray-300">Datos de Caja y Gastos</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">✂️</span>
            <span className="text-gray-700 dark:text-gray-300">Reportes Generados</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">✂️</span>
            <span className="text-gray-700 dark:text-gray-300">Libro Contable</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✅</span>
            <span className="text-gray-700 dark:text-gray-300"><strong>Se preservan:</strong> Clientes y Artículos</span>
          </div>
        </div>

        <button
          onClick={handleReset}
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading && <Loader size={18} className="animate-spin" />}
          {isLoading ? '⏳ Limpiando...' : '🗑️ Eliminar Datos Ficticios'}
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 <strong>Tip:</strong> Después de eliminar los datos ficticios, haz login nuevamente para cargar un sistema limpio.
        </p>
      </div>
    </div>
  );
}
