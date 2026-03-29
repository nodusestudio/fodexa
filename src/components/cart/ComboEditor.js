import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

const ComboEditor = ({ item, onConfirm, onCancel }) => {
  const [hasCombo, setHasCombo] = useState(
    item.addons?.some(a => a.id === 'combo-papas-bebida') || false
  );
  const [selectedDrink, setSelectedDrink] = useState(() => {
    const comboAddon = item.addons?.find(a => a.id === 'combo-papas-bebida');
    if (comboAddon) {
      // Extrae el nombre de la bebida del formato "Papas + NombreBebida"
      const match = comboAddon.name.match(/\+ (.+)$/);
      return match ? match[1] : null;
    }
    return null;
  });

  const drinks = [
    'Pepsi Original',
    'Pepsi 0',
    'Naranja',
    'Manzana',
    'Colombiana',
    'Uva',
    'Toronja',
  ];

  const COMBO_PRICE = 7000;

  const handleConfirm = () => {
    if (hasCombo && !selectedDrink) {
      alert('Por favor selecciona una bebida');
      return;
    }

    // Crear los nuevos add-ons
    const addons = item.addons?.filter(a => a.id !== 'combo-papas-bebida') || [];

    if (hasCombo) {
      addons.push({
        id: 'combo-papas-bebida',
        name: `Papas + ${selectedDrink}`,
        price: COMBO_PRICE,
      });
    }

    onConfirm(addons);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
            Editar Combo
          </h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {/* Info del producto */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
            <p className="font-semibold text-gray-800 dark:text-white text-sm mb-1">
              {item.name}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Precio base: ${item.price.toLocaleString('es-CO')}
            </p>
          </div>

          {/* Precios */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              <span className="font-semibold">Precio base:</span> ${item.price.toLocaleString('es-CO')}
            </p>
            {hasCombo && (
              <p className="text-sm text-orange-600 dark:text-orange-400">
                <span className="font-semibold">+ Combo (Papas + Bebida):</span> ${COMBO_PRICE.toLocaleString('es-CO')}
              </p>
            )}
            {hasCombo && (
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                Total: ${(item.price + COMBO_PRICE).toLocaleString('es-CO')}
              </p>
            )}
          </div>

          {/* Opción Combo */}
          <div className="space-y-3">
            <label
              className="flex items-center gap-3 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              style={{ borderColor: hasCombo ? '#3b82f6' : undefined, backgroundColor: hasCombo ? 'rgba(59, 130, 246, 0.1)' : undefined }}
            >
              <input
                type="checkbox"
                checked={hasCombo}
                onChange={(e) => {
                  setHasCombo(e.target.checked);
                  if (!e.target.checked) {
                    setSelectedDrink(null);
                  } else if (!selectedDrink) {
                    setSelectedDrink(drinks[0]);
                  }
                }}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 cursor-pointer"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-800 dark:text-white">
                  Agregar Papas + Bebida
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  +${COMBO_PRICE.toLocaleString('es-CO')} adicionales
                </p>
              </div>
            </label>

            {/* Selector de Bebida */}
            {hasCombo && (
              <div className="ml-8 space-y-2">
                <p className="font-semibold text-gray-800 dark:text-white text-sm">
                  🥤 Elige tu bebida:
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {drinks.map((drink) => (
                    <label
                      key={drink}
                      className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <input
                        type="radio"
                        name="drink"
                        value={drink}
                        checked={selectedDrink === drink}
                        onChange={(e) => setSelectedDrink(e.target.value)}
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                      />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {drink}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Check size={20} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComboEditor;
