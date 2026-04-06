import React from 'react';
import { useSettings } from '../../context/SettingsContext';

const TaxSettings = () => {
  const { settings, updateSettings } = useSettings();
  const taxes = settings.taxes;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          Configuración de Impuestos
        </h2>
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={taxes.enabled}
                onChange={e => updateSettings('taxes', 'enabled', e.target.checked)}
              />
              Aplicar impuesto
            </label>
          </div>
          {taxes.enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Porcentaje de impuesto (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={taxes.value}
                onChange={e => updateSettings('taxes', 'value', parseFloat(e.target.value))}
                onFocus={(e) => e.target.select()}
                className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxSettings;
