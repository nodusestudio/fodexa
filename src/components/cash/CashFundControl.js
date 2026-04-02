import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const CashFundControl = ({ fundAmount = 0, onClose, onUpdate, isStandalone = true }) => {
  const [bills, setBills] = useState({
    '100000': 0,
    '50000': 0,
    '20000': 0,
    '10000': 0,
    '5000': 0,
    '2000': 0,
    '1000': 0,
    '500': 0,
    '200': 0,
    '100': 0,
    '50': 0,
  });

  const [additionalAmount, setAdditionalAmount] = useState(0);

  const billDenominations = [
    { value: 50, label: '$50' },
    { value: 100, label: '$100' },
    { value: 200, label: '$200' },
    { value: 500, label: '$500' },
    { value: 1000, label: '$1K' },
    { value: 2000, label: '$2K' },
    { value: 5000, label: '$5K' },
    { value: 10000, label: '$10K' },
    { value: 20000, label: '$20K' },
    { value: 50000, label: '$50K' },
    { value: 100000, label: '$100K' },
  ];

  const billsTotal = useMemo(() => {
    return Object.keys(bills).reduce(
      (sum, denom) => sum + (parseInt(denom) * (bills[denom] || 0)),
      0
    );
  }, [bills]);

  const totalCalculated = billsTotal + (additionalAmount || 0);

  const handleReset = () => {
    setBills({
      '100000': 0,
      '50000': 0,
      '20000': 0,
      '10000': 0,
      '5000': 0,
      '2000': 0,
      '1000': 0,
      '500': 0,
      '200': 0,
      '100': 0,
      '50': 0,
    });
    setAdditionalAmount(0);
  };

  const handleSave = () => {
    onUpdate(totalCalculated);
    onClose();
  };

  const content = (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg">
      {/* Header */}
      <div className="flex justify-between items-center p-2 sm:p-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
        <h2 className="text-sm sm:text-lg font-bold text-gray-800 dark:text-white">
          Fondo de Caja
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
          <X size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>

      <div className="p-2 sm:p-3 space-y-2 sm:space-y-3 max-h-[80vh] overflow-y-auto">
          {/* Grid de Billetes - Ultra compacto */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1 sm:gap-2">
            {billDenominations.map(denom => (
              <div
                key={denom.value}
                className="bg-gray-50 dark:bg-gray-700 rounded p-1 sm:p-2"
              >
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5 sm:mb-1 text-center">
                  {denom.label}
                </div>
                <input
                  type="number"
                  min="0"
                  value={bills[String(denom.value)] || 0}
                  onChange={(e) =>
                    setBills(prev => ({
                      ...prev,
                      [String(denom.value)]: Math.max(0, parseInt(e.target.value) || 0)
                    }))
                  }
                  className="w-full text-center bg-white dark:bg-gray-600 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-500 rounded py-0.5 sm:py-1 text-xs"
                  placeholder="0"
                />
                <div className="text-xs text-gray-600 dark:text-gray-400 text-center mt-0.5">
                  {formatCurrency(denom.value * (bills[String(denom.value)] || 0))}
                </div>
              </div>
            ))}
          </div>

          {/* Monto Adicional */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-2 sm:p-3">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Monto Adicional
            </label>
            <input
              type="number"
              min="0"
              value={additionalAmount || ''}
              onChange={(e) => setAdditionalAmount(parseInt(e.target.value) || 0)}
              className="w-full bg-white dark:bg-gray-600 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-500 rounded py-1.5 sm:py-2 px-2 text-xs sm:text-sm"
              placeholder="Ingresa monto exacto"
            />
          </div>

          {/* Resumen */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:from-opacity-30 dark:to-purple-900 dark:to-opacity-30 rounded p-2 sm:p-3 border border-blue-200 dark:border-blue-800 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-700 dark:text-gray-400">Billetes:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(billsTotal)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-700 dark:text-gray-400">Adicional:</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(additionalAmount)}
              </span>
            </div>
            <div className="border-t border-blue-200 dark:border-blue-700 pt-1 flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-400 font-semibold text-xs">Total:</span>
              <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(totalCalculated)}
              </span>
            </div>
            {fundAmount !== totalCalculated && (
              <div className="flex justify-between items-center text-xs pt-1 border-t border-blue-200 dark:border-blue-700">
                <span className="text-gray-700 dark:text-gray-400">Diferencia:</span>
                <span className={`font-bold ${
                  totalCalculated === fundAmount ? 'text-green-600 dark:text-green-400' :
                  totalCalculated > fundAmount ? 'text-red-600 dark:text-red-400' :
                  'text-orange-600 dark:text-orange-400'
                }`}>
                  {formatCurrency(totalCalculated - fundAmount)}
                </span>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-1 sm:gap-2 pt-2 sm:pt-1">
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-1.5 sm:py-2 rounded font-medium transition-colors text-xs sm:text-sm"
            >
              Limpiar
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-1.5 sm:py-2 rounded font-medium transition-colors text-xs sm:text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 sm:py-2 rounded font-medium transition-colors text-xs sm:text-sm"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    );

  // Si es standalone, renderizar como modal completo
  if (isStandalone) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        {content}
      </div>
    );
  }

  // Si no es standalone, solo renderizar el contenido sin modal wrapper
  return content;
};

export default CashFundControl;
