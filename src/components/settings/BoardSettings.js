import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import TableManager from './TableManager';
import OrderButtonsSettings from './OrderButtonsSettings';
import KitchenButtonSettings from './KitchenButtonSettings';
import PaymentSettings from './PaymentSettings';

const BoardSettings = () => {
  const { settings, updateSettings } = useSettings();
  const [expandedSections, setExpandedSections] = useState({
    tables: false,
    buttons: false,
    kitchen: false,
    payment: false,
    delivery: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sections = [
    {
      id: 'tables',
      title: '🪑 Gestión de Mesas',
      description: 'Configura las mesas del restaurante',
      component: <TableManager />
    },
    {
      id: 'buttons',
      title: '⏰ Botones de Órdenes',
      description: 'Personaliza textos, colores y tiempos de alarma',
      component: <OrderButtonsSettings />
    },
    {
      id: 'kitchen',
      title: '👨‍🍳 Botón y Ticket de Cocina',
      description: 'Configura el botón de cocina y el ticket para impresión',
      component: <KitchenButtonSettings />
    },
    {
      id: 'payment',
      title: '💳 Métodos de Pago',
      description: 'Configura tipos de cobros, pago dividido y más',
      component: <PaymentSettings />
    },
    {
      id: 'delivery',
      title: '⏱️ Timer de Delivery',
      description: 'Configura los tiempos de alarma para órdenes de domicilio',
      component: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Primero aviso (minutos)
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={settings.deliveryTimer?.firstAlarmMinutes ?? 10}
              onChange={e => updateSettings('deliveryTimer', 'firstAlarmMinutes', parseInt(e.target.value, 10))}
              onFocus={(e) => e.target.select()}
              className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cuántos minutos después de recibir la orden saldrá la primera alarma</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Segundo aviso (minutos)
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={settings.deliveryTimer?.secondAlarmMinutes ?? 5}
              onChange={e => updateSettings('deliveryTimer', 'secondAlarmMinutes', parseInt(e.target.value, 10))}
              onFocus={(e) => e.target.select()}
              className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cuántos minutos para la segunda alarma (después de presionar 'Aún preparando')</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contratiempo de domicilio (minutos)
            </label>
            <input
              type="number"
              min={5}
              max={60}
              value={settings.deliveryTimer?.deliveryTimeoutMinutes ?? 20}
              onChange={e => updateSettings('deliveryTimer', 'deliveryTimeoutMinutes', parseInt(e.target.value, 10))}
              onFocus={(e) => e.target.select()}
              className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tiempo máximo para que llegue el domiciliario</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {sections.map(section => (
        <div
          key={section.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
        >
          {/* Header del acordeón */}
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="text-left">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {section.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {section.description}
              </p>
            </div>
            <ChevronDown
              size={24}
              className={`text-gray-600 dark:text-gray-400 flex-shrink-0 ml-4 transition-transform ${
                expandedSections[section.id] ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Contenido del acordeón */}
          {expandedSections[section.id] && (
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
              {section.component}
            </div>
          )}
        </div>
      ))}

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          <strong>💡 Tip:</strong> Expande cada sección para configurar los diferentes aspectos del tablero y las órdenes.
        </p>
      </div>
    </div>
  );
};

export default BoardSettings;
