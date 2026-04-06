import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';

const PaymentSettings = () => {
  const { settings, updateSettings } = useSettings();
  
  const defaultPayment = {
    buttonText: '💳 Cobrar',
    buttonColor: '#22c55e',
    methods: {
      cash: { name: '💵 Efectivo', enabled: true, icon: '💵', submethods: [] },
      card: { 
        name: '💳 Tarjeta', 
        enabled: true, 
        icon: '💳',
        submethods: [
          { id: 'visa', name: '💳 Visa', enabled: true },
          { id: 'mastercard', name: '💳 Mastercard', enabled: true },
          { id: 'amex', name: '💳 American Express', enabled: false },
          { id: 'other_card', name: '💳 Otra Tarjeta', enabled: true }
        ]
      },
      transfer: { 
        name: '🏦 Transferencia', 
        enabled: true, 
        icon: '🏦',
        submethods: [
          { id: 'bancolombia', name: '🏦 Bancolombia', enabled: true },
          { id: 'nequi', name: '📱 Nequi', enabled: true },
          { id: 'daviplata', name: '📱 Daviplata', enabled: false },
          { id: 'other_transfer', name: '🏦 Otra Transferencia', enabled: true }
        ]
      },
      pse: { name: '🔗 PSE', enabled: false, icon: '🔗', submethods: [] },
      check: { name: '📋 Cheque', enabled: false, icon: '📋', submethods: [] },
      credit: { name: '📝 Crédito', enabled: false, icon: '📝', submethods: [] }
    },
    splitPayment: { enabled: true, maxMethods: 2, allowPartial: true },
    requireNote: false,
    showBalance: true,
    autoClose: false
  };

  const payment = {
    ...defaultPayment,
    ...settings?.payment,
    methods: { ...defaultPayment.methods, ...(settings?.payment?.methods || {}) },
    splitPayment: { ...defaultPayment.splitPayment, ...(settings?.payment?.splitPayment || {}) }
  };

  const [expandedMethods, setExpandedMethods] = useState({});
  const standardMethods = ['cash', 'card', 'transfer', 'pse', 'check', 'credit'];

  const handlePaymentChange = (field, value) => {
    updateSettings('payment', null, { ...payment, [field]: value });
  };

  const handleMethodToggle = (key) => {
    updateSettings('payment', null, {
      ...payment,
      methods: {
        ...payment.methods,
        [key]: { ...payment.methods[key], enabled: !payment.methods[key].enabled }
      }
    });
  };

  const handleMethodNameChange = (key, newName) => {
    updateSettings('payment', null, {
      ...payment,
      methods: {
        ...payment.methods,
        [key]: { ...payment.methods[key], name: newName }
      }
    });
  };

  const handleSubmethodToggle = (methodKey, submethodId) => {
    const submethods = payment.methods[methodKey].submethods.map(sm =>
      sm.id === submethodId ? { ...sm, enabled: !sm.enabled } : sm
    );
    updateSettings('payment', null, {
      ...payment,
      methods: { ...payment.methods, [methodKey]: { ...payment.methods[methodKey], submethods } }
    });
  };

  const handleSubmethodNameChange = (methodKey, submethodId, newName) => {
    const submethods = payment.methods[methodKey].submethods.map(sm =>
      sm.id === submethodId ? { ...sm, name: newName } : sm
    );
    updateSettings('payment', null, {
      ...payment,
      methods: { ...payment.methods, [methodKey]: { ...payment.methods[methodKey], submethods } }
    });
  };

  const toggleMethodExpansion = (key) => {
    setExpandedMethods(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSplitPaymentChange = (field, value) => {
    updateSettings('payment', null, {
      ...payment,
      splitPayment: { ...payment.splitPayment, [field]: value }
    });
  };

  return (
    <div className="space-y-3">
      {/* SECCIÓN 1: Botón de Pago */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800 space-y-2">
        <h4 className="text-xs font-bold text-gray-900 dark:text-white">🖱️ Botón de Pago</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Texto</label>
            <input
              type="text"
              value={payment.buttonText || ''}
              onChange={(e) => handlePaymentChange('buttonText', e.target.value)}
              placeholder="ej: 💳 Cobrar"
              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
            <div className="flex gap-1">
              <input
                type="color"
                value={payment.buttonColor || '#22c55e'}
                onChange={(e) => handlePaymentChange('buttonColor', e.target.value)}
                className="w-10 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
              />
              <input
                type="text"
                value={payment.buttonColor || '#22c55e'}
                onChange={(e) => handlePaymentChange('buttonColor', e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: Métodos de Pago */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800 space-y-2">
        <h4 className="text-xs font-bold text-gray-900 dark:text-white">💳 Métodos de Pago</h4>
        <div className="space-y-1">
          {standardMethods.map(key => {
            const method = payment.methods?.[key];
            const hasSubmethods = method?.submethods && method.submethods.length > 0;
            const activeCount = method?.submethods?.filter(sm => sm.enabled).length || 0;

            return (
              <div key={key} className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <input
                    type="checkbox"
                    checked={method?.enabled || false}
                    onChange={() => handleMethodToggle(key)}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="text-sm flex-shrink-0">{method?.icon}</span>
                  <input
                    type="text"
                    value={method?.name || ''}
                    onChange={(e) => handleMethodNameChange(key, e.target.value)}
                    className="flex-1 px-1 py-0.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                  />
                  {hasSubmethods && (
                    <button
                      onClick={() => toggleMethodExpansion(key)}
                      className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition flex-shrink-0"
                    >
                      {expandedMethods[key] ? '▼' : '▶'} {activeCount}
                    </button>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {method?.enabled ? '✅' : '❌'}
                  </span>
                </div>

                {hasSubmethods && expandedMethods[key] && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
                    {method.submethods.map(sm => (
                      <div key={sm.id} className="flex items-center gap-1 p-1 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                        <input
                          type="checkbox"
                          checked={sm.enabled || false}
                          onChange={() => handleSubmethodToggle(key, sm.id)}
                          className="w-3 h-3 rounded cursor-pointer flex-shrink-0"
                        />
                        <input
                          type="text"
                          value={sm.name || ''}
                          onChange={(e) => handleSubmethodNameChange(key, sm.id, e.target.value)}
                          className="flex-1 px-1 py-0.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-xs"
                        />
                        <span className="text-xs text-gray-500 flex-shrink-0">{sm.enabled ? '✓' : '✗'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 3: Pago Dividido */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800 space-y-2">
        <h4 className="text-xs font-bold text-gray-900 dark:text-white">↔️ Pago Dividido</h4>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={payment.splitPayment?.enabled ?? true}
            onChange={(e) => handleSplitPaymentChange('enabled', e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-gray-700 dark:text-gray-300 font-medium">Permitir múltiples métodos</span>
        </label>
        {payment.splitPayment?.enabled && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-700 dark:text-gray-300 font-medium">Máximo:</label>
            <div className="flex gap-1">
              {[2, 3, 4].map(num => (
                <button
                  key={num}
                  onClick={() => handleSplitPaymentChange('maxMethods', num)}
                  className={`px-2 py-1 rounded text-xs font-medium transition ${
                    payment.splitPayment?.maxMethods === num
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={payment.splitPayment?.allowPartial ?? true}
            onChange={(e) => handleSplitPaymentChange('allowPartial', e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-gray-700 dark:text-gray-300 font-medium">Permitir pagos incompletos</span>
        </label>
      </div>

      {/* SECCIÓN 4: Opciones */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800 space-y-1">
        <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2">⚙️ Opciones</h4>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={payment.showBalance ?? true}
            onChange={(e) => handlePaymentChange('showBalance', e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-gray-700 dark:text-gray-300">Mostrar saldo pendiente</span>
        </label>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={payment.requireNote ?? false}
            onChange={(e) => handlePaymentChange('requireNote', e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-gray-700 dark:text-gray-300">Requerir nota al pagar</span>
        </label>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={payment.autoClose ?? false}
            onChange={(e) => handlePaymentChange('autoClose', e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-gray-700 dark:text-gray-300">Auto-cerrar orden</span>
        </label>
      </div>

      {/* Resumen Activos */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-2 rounded-lg">
        <p className="text-xs font-bold text-blue-900 dark:text-blue-200 mb-1">✅ Activos:</p>
        <div className="space-y-1">
          {standardMethods
            .filter(key => payment.methods?.[key]?.enabled)
            .map(key => {
              const method = payment.methods?.[key];
              const active = method?.submethods?.filter(sm => sm.enabled) || [];
              return (
                <div key={key} className="text-xs text-blue-900 dark:text-blue-200">
                  {method?.icon} {method?.name}
                  {active.length > 0 && (
                    <span className="ml-2 text-blue-700 dark:text-blue-300">
                      ({active.map(a => a.name).join(', ')})
                    </span>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;
