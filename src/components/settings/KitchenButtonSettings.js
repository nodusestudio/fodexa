import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Copy, Eye } from 'lucide-react';

const KitchenButtonSettings = () => {
  const { settings, updateSettings } = useSettings();
  const kitchenButton = settings?.kitchenButton || {};
  const [copyFeedback, setCopyFeedback] = useState('');
  const [previewModal, setPreviewModal] = useState(false);

  const handleKitchenButtonChange = (field, value) => {
    const updated = { ...kitchenButton, [field]: value };
    updateSettings('kitchenButton', null, updated);
  };

  const handleTextChange = (field, value) => {
    const updated = { ...kitchenButton, [field]: value };
    updateSettings('kitchenButton', null, updated);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback('¡Copiado!');
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  const getOrderType = (type, order) => {
    if (type === 'table') return `🪑 MESA ${order.tableNumber || '?'}`;
    if (type === 'delivery') return `🚚 DOMICILIO - ${order.deliveryData?.name || 'Cliente'}`;
    if (type === 'takeout') return `🛍️ PARA LLEVAR`;
    return 'PEDIDO';
  };

  return (
    <div className="space-y-6">
      {/* SECCIÓN 1: Configuración del Botón */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          🖱️ Configuración del Botón
        </h4>
        <div className="space-y-4">
          {/* Texto del Botón */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texto del Botón
            </label>
            <input
              type="text"
              value={kitchenButton.buttonText || ''}
              onChange={(e) => handleKitchenButtonChange('buttonText', e.target.value)}
              placeholder="ej: 🔔 Cocina"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Texto que aparecerá en el botón de cocina</p>
          </div>

          {/* Color del Botón */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Color del Botón
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={kitchenButton.buttonColor || '#f97316'}
                onChange={(e) => handleKitchenButtonChange('buttonColor', e.target.value)}
                className="w-16 h-10 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600"
              />
              <input
                type="text"
                value={kitchenButton.buttonColor || '#f97316'}
                onChange={(e) => handleKitchenButtonChange('buttonColor', e.target.value)}
                placeholder="#f97316"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
              />
            </div>
            <div className="mt-2 flex gap-2 flex-wrap">
              {['#f97316', '#ef4444', '#8b5cf6', '#3b82f6', '#06b6d4'].map(color => (
                <button
                  key={color}
                  onClick={() => handleKitchenButtonChange('buttonColor', color)}
                  className="w-8 h-8 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-400 transition cursor-pointer"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: Configuración del Ticket */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          🧾 Configuración del Ticket de Cocina
        </h4>
        <div className="space-y-4">
          {/* Título del Ticket */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título del Ticket
            </label>
            <input
              type="text"
              value={kitchenButton.ticketTitle || ''}
              onChange={(e) => handleKitchenButtonChange('ticketTitle', e.target.value)}
              placeholder="ej: 🍳 COCINA"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Encabezado principal del ticket</p>
          </div>

          {/* Texto encabezado personalizado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texto Personalizado (Encabezado)
            </label>
            <textarea
              value={kitchenButton.headerText || ''}
              onChange={(e) => handleKitchenButtonChange('headerText', e.target.value)}
              placeholder="ej: [Nombre restaurante]&#10;Cocina"
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm h-20 font-mono"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Aparecerá al inicio del ticket (máx 100 caracteres)</p>
          </div>

          {/* Texto pie personalizado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texto Personalizado (Pie)
            </label>
            <textarea
              value={kitchenButton.footerText || ''}
              onChange={(e) => handleKitchenButtonChange('footerText', e.target.value)}
              placeholder="ej: Gracias&#10;¡Buen provecho!"
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm h-20 font-mono"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Aparecerá al final del ticket (máx 100 caracteres)</p>
          </div>

          {/* Ancho del papel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ancho del Papel (mm)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={kitchenButton.paperWidth || 80}
                onChange={(e) => handleKitchenButtonChange('paperWidth', parseInt(e.target.value))}
                min="58"
                max="118"
                className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <div className="flex gap-1 flex-wrap">
                {[58, 80, 112].map(width => (
                  <button
                    key={width}
                    onClick={() => handleKitchenButtonChange('paperWidth', width)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      kitchenButton.paperWidth === width
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {width}mm
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ajusta según tu impresora (típico: 80mm)</p>
          </div>

          {/* Carácter separador */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Carácter Separador
            </label>
            <input
              type="text"
              value={kitchenButton.separatorCharacter || '-'}
              onChange={(e) => handleKitchenButtonChange('separatorCharacter', e.target.value.charAt(0) || '-')}
              maxLength="1"
              className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono text-center"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Para líneas divisorias en el ticket</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: Visibilidad en Ticket */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          👁️ Elementos a Mostrar en el Ticket
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mostrar Info de Mesa/Cliente */}
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <input
              type="checkbox"
              checked={kitchenButton.showTableInfo ?? true}
              onChange={(e) => handleKitchenButtonChange('showTableInfo', e.target.checked)}
              className="w-5 h-5 rounded cursor-pointer"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Mesa / Cliente</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">🪑 Mesa 5 / 🚚 Domicilio</p>
            </div>
          </label>

          {/* Mostrar Teléfono */}
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <input
              type="checkbox"
              checked={kitchenButton.showPhone ?? true}
              onChange={(e) => handleKitchenButtonChange('showPhone', e.target.checked)}
              className="w-5 h-5 rounded cursor-pointer"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Teléfono</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">📞 Para entregas</p>
            </div>
          </label>

          {/* Mostrar Notas */}
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <input
              type="checkbox"
              checked={kitchenButton.showNotes ?? true}
              onChange={(e) => handleKitchenButtonChange('showNotes', e.target.checked)}
              className="w-5 h-5 rounded cursor-pointer"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Notas Especiales</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Instrucciones del cliente</p>
            </div>
          </label>

          {/* Mostrar Addons */}
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <input
              type="checkbox"
              checked={kitchenButton.showAddons ?? true}
              onChange={(e) => handleKitchenButtonChange('showAddons', e.target.checked)}
              className="w-5 h-5 rounded cursor-pointer"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Extras / Addons</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ingredientes adicionales</p>
            </div>
          </label>

          {/* Mostrar Timestamp */}
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <input
              type="checkbox"
              checked={kitchenButton.showTimestamp ?? true}
              onChange={(e) => handleKitchenButtonChange('showTimestamp', e.target.checked)}
              className="w-5 h-5 rounded cursor-pointer"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Fecha y Hora</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">📅 Timestamp del pedido</p>
            </div>
          </label>
        </div>
      </div>

      {/* Vista Previa */}
      <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
        <button
          onClick={() => setPreviewModal(!previewModal)}
          className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-medium hover:gap-3 transition"
        >
          <Eye size={18} />
          {previewModal ? 'Ocultar vista previa' : 'Ver vista previa del ticket'}
        </button>

        {previewModal && (
          <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-amber-300 dark:border-amber-700 font-mono text-xs max-w-md overflow-x-auto">
            <div className="whitespace-pre-wrap text-center">
{`${kitchenButton.headerText ? `${kitchenButton.headerText}\n` : ''}${kitchenButton.separatorCharacter?.repeat(30) || '-'.repeat(30)}
${kitchenButton.ticketTitle || '🍳 COCINA'}
${kitchenButton.separatorCharacter?.repeat(30) || '-'.repeat(30)}

🪑 MESA 5
${kitchenButton.showTimestamp ? '📅 05/04/2026 14:30\n' : ''}
${kitchenButton.separatorCharacter?.repeat(30) || '-'.repeat(30)}

2x Hamburguesa Clásica
  + Queso Extra
  + Tomate
1x Papas Francesas

${kitchenButton.separatorCharacter?.repeat(30) || '-'.repeat(30)}
${kitchenButton.footerText ? `\n${kitchenButton.footerText}\n` : ''}`}
            </div>
          </div>
        )}
      </div>

      {/* Información */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          <strong>💡 Tip:</strong> Todos estos cambios se aplican automáticamente al botón "🔔 Cocina" en las tarjetas del tablero y al ticket impreso.
        </p>
      </div>
    </div>
  );
};

export default KitchenButtonSettings;
