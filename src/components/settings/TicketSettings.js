import React from 'react';
import { useSettings } from '../../context/SettingsContext';

const TicketSettings = () => {
  const { settings, updateSettings } = useSettings();
  const ticket = settings.ticket;

  const handleCheckbox = (key) => (e) => {
    updateSettings('ticket', key, e.target.checked);
  };

  const handleChange = (key) => (e) => {
    updateSettings('ticket', key, e.target.value);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          Configuración de Tickets
        </h2>
        <div className="space-y-4">
          {/* Formato de ticket */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Formato de Ticket</label>
            <select
              value={ticket.format}
              onChange={handleChange('format')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="thermal-58mm">Térmico 58mm</option>
              <option value="thermal-80mm">Térmico 80mm</option>
              <option value="letter">Carta</option>
            </select>
          </div>

          {/* Opciones de información a mostrar */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={ticket.showLogo} onChange={handleCheckbox('showLogo')} /> Logo
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={ticket.showCompanyName} onChange={handleCheckbox('showCompanyName')} /> Nombre empresa
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={ticket.showNIT} onChange={handleCheckbox('showNIT')} /> NIT
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={ticket.showAddress} onChange={handleCheckbox('showAddress')} /> Dirección
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={ticket.showPhone} onChange={handleCheckbox('showPhone')} /> Teléfono
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={ticket.showEmail} onChange={handleCheckbox('showEmail')} /> Email
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={ticket.showTicketNumber} onChange={handleCheckbox('showTicketNumber')} /> Número de ticket
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={ticket.showDateTime} onChange={handleCheckbox('showDateTime')} /> Fecha/hora
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={ticket.showItemsDetail} onChange={handleCheckbox('showItemsDetail')} /> Items detallados
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={ticket.showSubtotal} onChange={handleCheckbox('showSubtotal')} /> Subtotal
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={ticket.showIVA} onChange={handleCheckbox('showIVA')} /> IVA
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={ticket.showTotal} onChange={handleCheckbox('showTotal')} /> Total
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={ticket.showAddonsDetail} onChange={handleCheckbox('showAddonsDetail')} /> Desglose de adicionales
            </label>
          </div>

          {/* Mensaje de agradecimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mensaje de Agradecimiento</label>
            <input
              type="text"
              value={ticket.thankYouMessage || ''}
              onChange={handleChange('thankYouMessage')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="¡Gracias por tu compra!"
            />
          </div>

          {/* Tamaño de fuente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tamaño de Fuente</label>
            <select
              value={ticket.fontSize || 'normal'}
              onChange={handleChange('fontSize')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="small">Pequeña</option>
              <option value="normal">Normal</option>
              <option value="large">Grande</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketSettings;

