import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { useProducts } from '../../context/ProductContext';
import { X } from 'lucide-react';

const AddonSelector = ({ productId, onAddonsSelect, selectedAddons = [] }) => {
  const { addons } = useProducts();
  const [showSelector, setShowSelector] = useState(false);

  // Filtrar addons aplicables a este producto
  const applicableAddons = addons.filter(addon => {
    if (addon.status !== 'active') return false;
    if (!addon.applicableProducts || addon.applicableProducts.length === 0) return true;
    return addon.applicableProducts.includes(productId);
  });

  const toggleAddon = (addon) => {
    const isSelected = selectedAddons.find(a => a.id === addon.id);
    let newSelected;
    
    if (isSelected) {
      newSelected = selectedAddons.filter(a => a.id !== addon.id);
    } else {
      newSelected = [...selectedAddons, { ...addon, productId }];
    }
    
    onAddonsSelect(newSelected);
  };

  const totalAddons = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);

  if (applicableAddons.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setShowSelector(true)}
        className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
      >
        🎁 Agregar Adicionales ({selectedAddons.length})
      </button>

      {showSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                🎁 Agregar Adicionales
              </h3>
              <button onClick={() => setShowSelector(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
              {applicableAddons.map(addon => {
                const isSelected = selectedAddons.find(a => a.id === addon.id);
                return (
                  <label
                    key={addon.id}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleAddon(addon)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="text-gray-800 dark:text-white font-medium">{addon.name}</span>
                    </div>
                    <span className="text-purple-600 dark:text-purple-400 font-semibold">
                      +{formatCurrency(addon.price)}
                    </span>
                  </label>
                );
              })}
            </div>

            {selectedAddons.length > 0 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Total adicionales:</span>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    +{formatCurrency(totalAddons)}
                  </span>
                </div>
              </div>
            )}

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowSelector(false)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddonSelector;
