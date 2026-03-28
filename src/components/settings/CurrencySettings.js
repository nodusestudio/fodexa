import React from 'react';
import { useSettings } from '../../context/SettingsContext';

const CurrencySettings = () => {
  const { settings, updateSettings } = useSettings();
  const currency = settings.currency;

  const monedas = [
    { code: 'COP', name: 'Peso Colombiano' },
    { code: 'USD', name: 'Dólar Estadounidense' },
    { code: 'EUR', name: 'Euro' },
    { code: 'MXN', name: 'Peso Mexicano' },
    { code: 'BRL', name: 'Real Brasileño' },
    { code: 'CLP', name: 'Peso Chileno' },
    { code: 'PEN', name: 'Sol Peruano' },
    { code: 'ARS', name: 'Peso Argentino' },
    { code: 'VEF', name: 'Bolívar Venezolano' },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          Configuración de Moneda
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Moneda</label>
            <select
              value={currency.code}
              onChange={e => updateSettings('currency', 'code', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {monedas.map(m => (
                <option key={m.code} value={m.code}>{m.name} ({m.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={currency.decimals}
                onChange={e => updateSettings('currency', 'decimals', e.target.checked)}
              />
              Usar decimales
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencySettings;
