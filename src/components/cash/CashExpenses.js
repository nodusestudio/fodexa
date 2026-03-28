import React, { useState } from 'react';
import { useCash } from '../../context/CashContext';
import { MinusCircle, X } from 'lucide-react';

const CashExpenses = ({ onClose }) => {
  const { addExpense, getTodayExpenses } = useCash();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('otros');
  const [description, setDescription] = useState('');

  const categories = [
    { value: 'proveedores', label: '📦 Proveedores' },
    { value: 'servicios', label: '💡 Servicios Públicos' },
    { value: 'mantenimiento', label: '🔧 Mantenimiento' },
    { value: 'transporte', label: '🚗 Transporte' },
    { value: 'alimentacion', label: '🍽️ Alimentación' },
    { value: 'impuestos', label: '📄 Impuestos' },
    { value: 'nomina', label: '👥 Nómina' },
    { value: 'otros', label: '📝 Otros' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('⚠️ Ingresa un monto válido');
      return;
    }

    addExpense({ amount, category, description });
    setAmount('');
    setDescription('');
    alert('✅ Egreso registrado exitosamente');
  };

  const todayExpenses = getTodayExpenses();
  const totalExpenses = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <MinusCircle size={28} className="text-red-600 dark:text-red-400" />
            Registrar Egreso
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monto del Egreso *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-red-500 text-lg"
              placeholder="0.00"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoría *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-red-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción *
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-red-500"
              placeholder="Descripción detallada del egreso..."
              required
            />
          </div>

          {/* Resumen del día */}
          <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">
              📊 Egresos del Día
            </h4>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              ${totalExpenses.toLocaleString()}
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {todayExpenses.length} egresos registrados
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
              className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              💸 Registrar Egreso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashExpenses;
