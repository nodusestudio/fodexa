import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { AlertTriangle, Loader, RefreshCw } from 'lucide-react';

export default function ResetDataSettings() {
  const { resetUserData, hardResetSystem } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [isHardResetLoading, setIsHardResetLoading] = useState(false);

  const handleReset = async () => {
    const confirmed = window.confirm(
      '⚠️ ¿ESTÁS COMPLETAMENTE SEGURO?\n\n' +
      'Se eliminarán TODOS estos datos:\n' +
      '✂️ Órdenes (mesas, para llevar, domicilios)\n' +
      '✂️ Tickets de Venta\n' +
      '✂️ Caja y Gastos\n' +
      '✂️ Reportes\n' +
      '✂️ Libro Contable\n\n' +
      '✅ SE GUARDARÁN: Clientes y Artículos\n\n' +
      'Esta acción NO SE PUEDE DESHACER.\n\n' +
      'Escribe "ELIMINAR" para confirmar.'
    );

    if (!confirmed) return;

    // Segunda confirmación con input
    const secondConfirm = window.prompt(
      'Escribe "ELIMINAR" para confirmar definitivamente:'
    );

    if (secondConfirm !== 'ELIMINAR') {
      alert('❌ Operación cancelada');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await resetUserData();
      
      if (success) {
        // resetUserData recarga automáticamente
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al resetear: ' + error.message);
      setIsLoading(false);
    }
  };

  const handleHardReset = () => {
    const confirmed = window.confirm(
      '⚠️ RESTAURAR SISTEMA\n\n' +
      'Se limpiarán TODOS los datos locales y se recargará la aplicación.\n\n' +
      '✅ Clientes, productos y configuración se mantienen\n' +
      '✂️ Se limpiarán: órdenes, tickets, caja, reportes\n\n' +
      '¿Continuar?'
    );

    if (!confirmed) return;

    setIsHardResetLoading(true);
    hardResetSystem();
    // La función ya hace reload, pero asegurar timeout
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
          🗑️ Limpiar Sistema (Resetear Todo)
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          <strong className="text-red-600 dark:text-red-400">⚠️ ATENCIÓN:</strong> Eliminará TODA la información de órdenes, tickets, caja y reportes.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          <strong className="text-green-600 dark:text-green-400">✅ Preservará:</strong> Clientes y Artículos
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

        {/* Hard Reset Button - Más Simple y Directo */}
        <button
          onClick={handleHardReset}
          disabled={isHardResetLoading}
          className="w-full sm:w-auto px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 mt-3"
        >
          {isHardResetLoading && <Loader size={18} className="animate-spin" />}
          {isHardResetLoading ? '🔄 Restaurando...' : '🔄 Restaurar Sistema'}
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded space-y-2">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>📌 Opciones de Limpieza:</strong>
        </p>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          🗑️ <strong>Eliminar Datos:</strong> Intenta eliminar todo de Firestore (envía a nube)
        </p>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          🔄 <strong>Restaurar Sistema:</strong> Limpia tu navegador completamente y recarga (más rápido)
        </p>
      </div>
    </div>
  );
}
