import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';

const defaultDeliveryPresets = [30, 40, 50];

const DeliverySettings = () => {
  const { settings, updateSettings } = useSettings();
  const [showDelivery, setShowDelivery] = useState(settings?.delivery?.enabled ?? true);
  const [baseAmount, setBaseAmount] = useState(settings?.delivery?.baseAmount ?? 0);
  const [presets, setPresets] = useState(settings?.delivery?.presets ?? defaultDeliveryPresets);

  const handleToggle = (e) => {
    setShowDelivery(e.target.checked);
    updateSettings('delivery', 'enabled', e.target.checked);
  };

  const handleBaseAmount = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setBaseAmount(value);
    updateSettings('delivery', 'baseAmount', value);
  };

  const handlePresetChange = (idx, value) => {
    const newPresets = [...presets];
    newPresets[idx] = parseFloat(value) || 0;
    setPresets(newPresets);
    updateSettings('delivery', 'presets', newPresets);
  };

  const handleAddPreset = () => {
    setPresets([...presets, 0]);
    updateSettings('delivery', 'presets', [...presets, 0]);
  };

  const handleRemovePreset = (idx) => {
    const newPresets = presets.filter((_, i) => i !== idx);
    setPresets(newPresets);
    updateSettings('delivery', 'presets', newPresets);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-xl shadow p-3 sm:p-6 space-y-4 sm:space-y-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
        🛵 Configuración de Domicilios
      </h2>
      <div className="flex items-center gap-3 mb-4">
        <input type="checkbox" id="showDelivery" checked={showDelivery} onChange={handleToggle} className="accent-blue-600 w-4 sm:w-5 h-4 sm:h-5" />
        <label htmlFor="showDelivery" className="text-sm sm:text-base text-gray-700 dark:text-gray-200 font-medium">Mostrar opción de domicilio</label>
      </div>
      <div className="mb-4">
        <label className="block text-sm sm:text-base text-gray-700 dark:text-gray-300 font-semibold mb-2">Monto base de domicilio</label>
        <input
          type="number"
          className="w-32 sm:w-40 border border-gray-300 dark:border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          value={baseAmount}
          onChange={handleBaseAmount}
          onFocus={(e) => e.target.select()}
          min={0}
        />
      </div>
      <div>
        <label className="block text-sm sm:text-base text-gray-700 dark:text-gray-300 font-semibold mb-3">Montos predeterminados</label>
        <div className="space-y-2 sm:space-y-3">
          {presets.map((preset, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="number"
                className="w-28 sm:w-32 border border-gray-300 dark:border-gray-600 rounded-lg px-2 sm:px-3 py-1 sm:py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                value={preset}
                onChange={e => handlePresetChange(idx, e.target.value)}
                onFocus={(e) => e.target.select()}
                min={0}
              />
              <button
                type="button"
                className="text-xs sm:text-sm text-red-500 hover:text-red-700 px-2 sm:px-3 py-1 rounded transition-colors border border-transparent hover:border-red-300"
                onClick={() => handleRemovePreset(idx)}
                disabled={presets.length <= 1}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-3 px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow transition-colors"
          onClick={handleAddPreset}
        >
          + Agregar monto
        </button>
      </div>
    </div>
  );
};

export default DeliverySettings;
