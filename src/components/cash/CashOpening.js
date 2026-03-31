import React, { useState } from 'react';
import { useCash } from '../../context/CashContext';
import { DollarSign, X } from 'lucide-react';

const CashOpening = ({ onClose }) => {
  const { openCash } = useCash();
  const [initialAmount, setInitialAmount] = useState('');
  const [fundAmount, setFundAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [breakdown, setBreakdown] = useState({
    100000: 0,
    50000: 0,
    20000: 0,
    10000: 0,
    5000: 0,
    2000: 0,
    1000: 0,
    500: 0,
    200: 0,
    100: 0,
    50: 0,
  });

  const calculateTotal = () => {
    return Object.entries(breakdown).reduce((total, [denomination, count]) => {
      return total + (parseInt(denomination) * parseInt(count || 0));
    }, 0);
  };

  const updateBreakdown = (denomination, count) => {
    setBreakdown(prev => ({
      ...prev,
      [denomination]: parseInt(count) || 0,
    }));
    setInitialAmount((calculateTotal() - (breakdown[denomination] * denomination)) + (parseInt(count) || 0) * denomination);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!initialAmount && !fundAmount) {
      alert('⚠️ Ingresa un monto inicial o de fondo válido');
      return;
    }

    const totalBreakdown = calculateTotal();
    if (parseFloat(initialAmount) < 0) {
      alert('⚠️ Ingresa un monto inicial válido');
      return;
    }

    openCash({
      initialAmount: parseFloat(initialAmount) || 0,
      fundAmount: parseFloat(fundAmount) || 0,
      breakdown,
      notes,
      openedAt: new Date(),
    });
    onClose();
  };

  const denominations = [
    { value: 100000, label: '$100.000', color: 'bg-purple-600' },
    { value: 50000, label: '$50.000', color: 'bg-red-500' },
    { value: 20000, label: '$20.000', color: 'bg-blue-500' },
    { value: 10000, label: '$10.000', color: 'bg-orange-500' },
    { value: 5000, label: '$5.000', color: 'bg-purple-500' },
    { value: 2000, label: '$2.000', color: 'bg-gray-500' },
    { value: 1000, label: '$1.000', color: 'bg-green-500' },
    { value: 500, label: '$500', color: 'bg-yellow-500' },
    { value: 200, label: '$200', color: 'bg-pink-500' },
    { value: 100, label: '$100', color: 'bg-indigo-500' },
    { value: 50, label: '$50', color: 'bg-teal-500' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <DollarSign size={28} className="text-green-600 dark:text-green-400" />
            Apertura de Caja
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Desglose de billetes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              📊 Desglose de Billetes y Monedas
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {denominations.map(denom => (
                <div key={denom.value} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {denom.label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={breakdown[denom.value]}
                    onChange={(e) => updateBreakdown(denom.value, e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                    ${(denom.value * (breakdown[denom.value] || 0)).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-green-800 dark:text-green-300">
                Total Caja:
              </span>
              <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                ${calculateTotal().toLocaleString()}
              </span>
            </div>
          </div>

          {/* Input manual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monto Caja (si no usas desglose)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500"
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              💡 Este monto es el capital de caja del día y abrirá en $0
            </p>
          </div>

          {/* Fondo */}
          <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg p-4">
            <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
              💰 Fondo de Caja (Separado del movimiento del día)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              className="w-full px-4 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
              ℹ️ El fondo de caja NO se cuenta en el cierre ni en los cálculos del día
            </p>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observaciones (opcional)
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500"
              placeholder="Ej: Cambio inicial para el día..."
            />
          </div>

          {/* Resumen */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>Capital de Caja:</strong> ${(parseFloat(initialAmount) || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>Fondo de Caja:</strong> ${(parseFloat(fundAmount) || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-sm font-semibold text-gray-800 dark:text-white border-t border-gray-300 dark:border-gray-600 pt-2">
              <strong>Total en Físico:</strong> ${((parseFloat(initialAmount) || 0) + (parseFloat(fundAmount) || 0)).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
            >
              💰 Abrir Caja
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashOpening;
