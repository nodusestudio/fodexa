import React, { useState } from 'react';
import { useCash } from '../../context/CashContext';
import { MinusCircle, X } from 'lucide-react';

const CashExpenses = ({ onClose }) => {
  const { addExpense, getTodayExpenses } = useCash();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paymentType, setPaymentType] = useState('efectivo');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('⚠️ Ingresa un monto válido');
      return;
    }

    if (!category.trim()) {
      alert('⚠️ Ingresa una categoría');
      return;
    }

    addExpense({ amount, category: category.trim(), paymentType });
    setAmount('');
    setCategory('');
    setPaymentType('efectivo');
    alert('✅ Egreso registrado exitosamente');
  };

  const todayExpenses = getTodayExpenses();
  const totalExpenses = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <MinusCircle size={20} className="sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
            Egreso
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* Monto */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Monto *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onFocus={(e) => e.target.select()}
              className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-red-500 text-sm"
              placeholder="0.00"
              autoFocus
            />
          </div>

          {/* Categoría - Texto libre */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoría *
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-red-500 text-sm"
              placeholder="Ej: Suministros..."
            />
          </div>

          {/* Tipo de Pago */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Pago *
            </label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-red-500 text-sm"
            >
              <option value="efectivo">💵 Efectivo</option>
              <option value="bancolombia">🏦 Bancolombia</option>
              <option value="nequi">📱 Nequi</option>
            </select>
          </div>

          {/* Resumen del día */}
          <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded-lg p-3 mt-3 sm:mt-4">
            <p className="text-xs text-red-600 dark:text-red-400 mb-1">Egresos del día</p>
            <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
              ${totalExpenses.toLocaleString()}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {todayExpenses.length} registrados
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-2 text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
            >
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashExpenses;
