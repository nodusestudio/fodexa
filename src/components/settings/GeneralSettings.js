import React from 'react';
import { useSettings } from '../../context/SettingsContext';

const GeneralSettings = () => {
  const { settings, updateSettings } = useSettings();
  const general = settings.general;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          Configuración General
        </h2>
        <div className="space-y-4">
          {/* Número de ticket inicial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Número de ticket inicial</label>
            <input
              type="number"
              min={1}
              value={general.ticketNumberStart}
              onChange={e => updateSettings('general', 'ticketNumberStart', parseInt(e.target.value, 10))}
              className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Longitud de número de ticket */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Longitud de número de ticket</label>
            <input
              type="number"
              min={1}
              max={12}
              value={general.ticketNumberLength}
              onChange={e => updateSettings('general', 'ticketNumberLength', parseInt(e.target.value, 10))}
              className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Imprimir automáticamente después de pagar */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={general.autoPrintAfterPayment}
                onChange={e => updateSettings('general', 'autoPrintAfterPayment', e.target.checked)}
              />
              Imprimir automáticamente después de pagar
            </label>
          </div>
          {/* Sonido al recibir pedido */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={general.playSoundOnOrder}
                onChange={e => updateSettings('general', 'playSoundOnOrder', e.target.checked)}
              />
              Sonido al recibir pedido
            </label>
          </div>
          {/* Tiempo de sesión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tiempo de sesión (minutos)</label>
            <input
              type="number"
              min={1}
              max={240}
              value={general.sessionTimeout}
              onChange={e => updateSettings('general', 'sessionTimeout', parseInt(e.target.value, 10))}
              className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Permitir ventas sin stock */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={general.allowSalesWithoutStock}
                onChange={e => updateSettings('general', 'allowSalesWithoutStock', e.target.checked)}
              />
              Permitir ventas sin stock
            </label>
          </div>
          {/* Alerta de stock bajo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Alerta de stock bajo (cantidad)</label>
            <input
              type="number"
              min={1}
              value={general.lowStockAlert}
              onChange={e => updateSettings('general', 'lowStockAlert', parseInt(e.target.value, 10))}
              className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
