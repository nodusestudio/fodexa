import React, { useContext } from 'react';
import { SettingsContext } from '../../context/SettingsContext';

const OrderButtonsSettings = () => {
  const { settings, updateSettings } = useContext(SettingsContext);

  // Valores por defecto seguros
  const defaultOrderButtons = {
    alarmTime: 20,
    alarmSound: true,
    buttonTexts: {
      cook: '▶ Cocinar',
      cooking: '🍳 Cocinando',
      served: '✅ Mesa servida'
    },
    colors: {
      pending: '#FBBF24',
      preparing: '#F97316',
      ready: '#22C55E'
    },
    estimatedTime: 15,
    showTimer: true,
    enableAutoAlarm: true
  };

  const orderButtons = settings?.orderButtons || defaultOrderButtons;

  const handleOrderButtonsChange = (field, value) => {
    const updated = {
      ...orderButtons,
      [field]: value
    };
    updateSettings('orderButtons', null, updated);
  };

  const handleTextChange = (textKey, value) => {
    const updated = {
      ...orderButtons,
      buttonTexts: {
        ...orderButtons.buttonTexts,
        [textKey]: value
      }
    };
    updateSettings('orderButtons', null, updated);
  };

  const handleColorChange = (colorKey, value) => {
    const updated = {
      ...orderButtons,
      colors: {
        ...orderButtons.colors,
        [colorKey]: value
      }
    };
    updateSettings('orderButtons', null, updated);
  };

  return (
    <div className="space-y-6">
      {/* Tiempos y Alarma */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">⏰ Tiempos y Alarma</h3>
        
        <div className="space-y-4">
          {/* Tiempo de Alarma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minutos para Alarma 🔴
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="5"
                max="60"
                value={orderButtons.alarmTime}
                onChange={(e) => handleOrderButtonsChange('alarmTime', parseInt(e.target.value))}
                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="text-gray-600 dark:text-gray-400">minutos</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              La alarma se activará cuando el contador llegue a este tiempo
            </p>
          </div>

          {/* Tiempo Estimado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tiempo Estimado de Preparación
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="5"
                max="120"
                value={orderButtons.estimatedTime}
                onChange={(e) => handleOrderButtonsChange('estimatedTime', parseInt(e.target.value))}
                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="text-gray-600 dark:text-gray-400">minutos</span>
            </div>
          </div>

          {/* Toggles */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="alarmSound"
                checked={orderButtons.alarmSound}
                onChange={(e) => handleOrderButtonsChange('alarmSound', e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <label htmlFor="alarmSound" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                🔔 Reproducir sonido en alarma
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showTimer"
                checked={orderButtons.showTimer}
                onChange={(e) => handleOrderButtonsChange('showTimer', e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <label htmlFor="showTimer" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                ⏱️ Mostrar contador en tarjeta
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableAutoAlarm"
                checked={orderButtons.enableAutoAlarm}
                onChange={(e) => handleOrderButtonsChange('enableAutoAlarm', e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <label htmlFor="enableAutoAlarm" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                🤖 Alarma automática sin hacer clic
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Textos de Botones */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">📝 Textos de Botones</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Botón Inicial (Pendiente)
            </label>
            <input
              type="text"
              value={orderButtons.buttonTexts.cook}
              onChange={(e) => handleTextChange('cook', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="ej: ▶ Cocinar"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Botón Cocinando (En Preparación)
            </label>
            <input
              type="text"
              value={orderButtons.buttonTexts.cooking}
              onChange={(e) => handleTextChange('cooking', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="ej: 🍳 Cocinando"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Botón Servido (Listo)
            </label>
            <input
              type="text"
              value={orderButtons.buttonTexts.served}
              onChange={(e) => handleTextChange('served', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="ej: ✅ Mesa servida"
            />
          </div>
        </div>
      </div>

      {/* Colores */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">🎨 Esquema de Colores</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Pendiente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pendiente
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={orderButtons.colors.pending}
                  onChange={(e) => handleColorChange('pending', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={orderButtons.colors.pending}
                  onChange={(e) => handleColorChange('pending', e.target.value)}
                  className="flex-1 px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div
                className="w-full h-8 rounded mt-2 border-2 border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: orderButtons.colors.pending }}
              />
            </div>

            {/* Preparando */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preparando
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={orderButtons.colors.preparing}
                  onChange={(e) => handleColorChange('preparing', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={orderButtons.colors.preparing}
                  onChange={(e) => handleColorChange('preparing', e.target.value)}
                  className="flex-1 px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div
                className="w-full h-8 rounded mt-2 border-2 border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: orderButtons.colors.preparing }}
              />
            </div>

            {/* Listo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Listo/Servido
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={orderButtons.colors.ready}
                  onChange={(e) => handleColorChange('ready', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={orderButtons.colors.ready}
                  onChange={(e) => handleColorChange('ready', e.target.value)}
                  className="flex-1 px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div
                className="w-full h-8 rounded mt-2 border-2 border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: orderButtons.colors.ready }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          <strong>💡 Tip:</strong> Estos ajustes se aplican automáticamente a todas las tarjetas de órdenes. El contador mostrará MM:SS y cambiará de color al alcanzar el tiempo de alarma especificado.
        </p>
      </div>
    </div>
  );
};

export default OrderButtonsSettings;
