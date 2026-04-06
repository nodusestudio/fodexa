import React, { useMemo } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { User as UserIcon, Phone, MapPin, Home } from 'lucide-react';

function DeliveryForm({ deliveryData, onChange, deliveryCost, onCostChange }) {
  const { settings } = useSettings();
  // useMemo para asegurar re-render si cambian los presets
  const deliveryPresets = useMemo(() => settings?.delivery?.presets || [30, 40, 50], [settings?.delivery?.presets]);
  const handleInput = (field) => (e) => {
    onChange({ ...deliveryData, [field]: e.target.value });
  };

  const isMissing =
    !deliveryData.name ||
    !deliveryData.phone ||
    !deliveryData.address ||
    deliveryCost === '' || deliveryCost === null || deliveryCost === undefined;

  return (
    <div>
      <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-gray-800 dark:text-white">Datos de Domicilio</h3>
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-2 sm:gap-3">
          <UserIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-2 sm:mt-0" />
          <input
            type="text"
            required
            placeholder="Nombre completo del cliente"
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={deliveryData.name}
            onChange={handleInput('name')}
          />
        </div>
        <div className="flex items-start sm:items-center gap-2 sm:gap-3">
          <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-2 sm:mt-0" />
          <input
            type="tel"
            required
            placeholder="300 123 4567"
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={deliveryData.phone}
            onChange={handleInput('phone')}
          />
        </div>
        <div className="flex items-start gap-2 sm:gap-3">
          <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-2" />
          <textarea
            required
            rows={2}
            placeholder="Calle, número, barrio, ciudad"
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={deliveryData.address}
            onChange={handleInput('address')}
          />
        </div>
        <div className="flex items-start gap-2 sm:gap-3">
          <Home className="w-5 h-5 text-gray-400 flex-shrink-0 mt-2" />
          <textarea
            rows={2}
            placeholder="Casa azul, portón negro, junto a..."
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={deliveryData.reference || ''}
            onChange={handleInput('reference')}
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Costo de Domicilio</span>
          <div className="flex items-center gap-2 flex-1">
            <input
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="0.00"
              onFocus={(e) => e.target.select()}
              className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={deliveryCost}
              onChange={onCostChange}
            />
            <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm font-semibold whitespace-nowrap">
              ${parseFloat(deliveryCost || 0).toFixed(2)}
            </span>
          </div>
        </div>
        {/* Botones de selección rápida */}
        <div className="flex flex-wrap gap-2 mt-3 sm:mt-2">
          {deliveryPresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              className="px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 font-semibold text-xs sm:text-sm border border-blue-300 dark:border-blue-600 transition-colors"
              onClick={() => onCostChange({ target: { value: preset } })}
            >
              ${preset}
            </button>
          ))}
        </div>
      </div>
      {isMissing && (
        <p className="text-red-500 text-sm mt-3">Completa todos los campos requeridos</p>
      )}
    </div>
  );
}

export default DeliveryForm;
