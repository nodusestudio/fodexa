import React, { useContext } from 'react';
import { SettingsContext } from '../../context/SettingsContext';

const DeliveryTimerSettings = () => {
  const { settings, updateSettings } = useContext(SettingsContext);

  // Valores por defecto seguros
  const defaultDeliveryTimer = {
    firstAlarmMinutes: 10,
    secondAlarmMinutes: 5,
    deliveryTimeoutMinutes: 20
  };

  const defaultSystemAlerts = {
    soundType: 'beep-double',
    soundVolume: 80
  };

  const deliveryTimer = settings?.deliveryTimer || defaultDeliveryTimer;
  const systemAlerts = settings?.systemAlerts || defaultSystemAlerts;

  const handleDeliveryTimerChange = (field, value) => {
    const updated = {
      ...deliveryTimer,
      [field]: value
    };
    updateSettings('deliveryTimer', null, updated);
  };

  const handleSystemAlertsChange = (field, value) => {
    const updated = {
      ...systemAlerts,
      [field]: value
    };
    updateSettings('systemAlerts', null, updated);
  };

  const soundTypes = [
    { id: 'beep-double', name: '🔔 Doble beep' },
    { id: 'beep-triple', name: '🔔 Triple beep' },
    { id: 'alarm', name: '🚨 Alarma aguda' },
    { id: 'siren', name: '🚨 Sirena' }
  ];

  return (
    <div className="space-y-6">
      {/* Configuración de Timer de Delivery */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">🚚 Timer de Delivery</h3>
        
        <div className="space-y-4">
          {/* Primera Alarma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ⏰ Primera Alarma (cuando se crea la orden)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="30"
                value={deliveryTimer.firstAlarmMinutes}
                onChange={(e) => handleDeliveryTimerChange('firstAlarmMinutes', parseInt(e.target.value))}
                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="text-gray-600 dark:text-gray-400">minutos</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Se mostrará una alerta flotante cuando se cree una orden de delivery y pasen estos minutos
            </p>
          </div>

          {/* Segunda Alarma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ⏰ Segunda Alarma (al hacer clic "Aún preparando")
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="30"
                value={deliveryTimer.secondAlarmMinutes}
                onChange={(e) => handleDeliveryTimerChange('secondAlarmMinutes', parseInt(e.target.value))}
                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="text-gray-600 dark:text-gray-400">minutos</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Se reiniciará el contador a este tiempo cuando el usuario hace clic en "Aún preparando"
            </p>
          </div>

          {/* Timeout de Domicilios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ⏰ Timeout en Domicilios (máximo tiempo esperado)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="10"
                max="120"
                value={deliveryTimer.deliveryTimeoutMinutes}
                onChange={(e) => handleDeliveryTimerChange('deliveryTimeoutMinutes', parseInt(e.target.value))}
                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="text-gray-600 dark:text-gray-400">minutos</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Tiempo máximo que el domicilio debe aparecer en la lista de espera
            </p>
          </div>
        </div>
      </div>

      {/* Configuración de Alertas del Sistema */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">🔔 Alertas del Sistema</h3>
        
        <div className="space-y-4">
          {/* Tipo de Sonido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🔊 Tipo de Sonido
            </label>
            <select
              value={systemAlerts.soundType}
              onChange={(e) => handleSystemAlertsChange('soundType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {soundTypes.map(sound => (
                <option key={sound.id} value={sound.id}>
                  {sound.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Sonido que se reproducirá cuando se dispare la alarma
            </p>
          </div>

          {/* Volumen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🔉 Volumen: <span className="font-bold text-blue-600">{systemAlerts.soundVolume}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={systemAlerts.soundVolume}
              onChange={(e) => handleSystemAlertsChange('soundVolume', parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Volumen de reproducción del sonido de alerta
            </p>
          </div>
        </div>
      </div>

      {/* Información */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>ℹ️ Nota:</strong> Los tiempos configurados se aplicarán a todas las órdenes de delivery que se creen a partir de ahora.
        </p>
      </div>
    </div>
  );
};

export default DeliveryTimerSettings;
