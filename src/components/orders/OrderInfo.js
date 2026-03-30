
import React, { useState, useEffect, useMemo } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useOrder } from '../../context/OrderContext';
import { Bike, Phone, MapPin, X } from 'lucide-react';

const OrderInfo = ({ orderType, tableNumber, deliveryData, onClear, onConfirm }) => {
  const { setDeliveryData } = useOrder();
  const { settings } = useSettings();
  // Estado local para el input de costo
  const [localCost, setLocalCost] = useState(deliveryData?.cost || 0);
  // Presets dinámicos desde configuración
  const deliveryPresets = useMemo(() => settings?.delivery?.presets || [30, 40, 50], [settings?.delivery?.presets]);

  // Sincronizar localCost cuando deliveryData.cost cambie desde fuera
  useEffect(() => {
    setLocalCost(deliveryData?.cost || 0);
  }, [deliveryData?.cost]);

  // Actualizar contexto y local en tiempo real
  const updateDeliveryCost = (cost) => {
    setLocalCost(cost);
    setDeliveryData({ cost });
  };

  const handleProceed = () => {
    if (localCost > 0 && onConfirm) {
      onConfirm();
    }
  };

  return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2.5 sm:p-3.5 md:p-4 lg:p-5 mb-2.5 sm:mb-3.5 md:mb-4 lg:mb-5 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
        <div className="flex justify-between items-start mb-2.5 sm:mb-3 md:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-1 min-w-0">
            {orderType === 'table' && (
              <>
                <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl flex-shrink-0">🪑</span>
                <div className="min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm md:text-base lg:text-lg text-gray-800 dark:text-white">Mesa {tableNumber}</h3>
                </div>
              </>
            )}
          
            {orderType === 'delivery' && (
              <>
                <Bike size={18} className="text-orange-600 dark:text-orange-400 flex-shrink-0 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                <div className="min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm md:text-base lg:text-lg text-gray-800 dark:text-white">Domicilio</h3>
                  {deliveryData?.name && (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{deliveryData.name}</p>
                  )}
                </div>
              </>
            )}
          
            {orderType === 'takeout' && (
              <>
                <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl flex-shrink-0">🛒</span>
                <div className="min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm md:text-base lg:text-lg text-gray-800 dark:text-white">Para Llevar</h3>
                </div>
              </>
            )}
          </div>
        
          <button 
            onClick={onClear} 
            className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
          >
            <X size={18} />
          </button>
        </div>

        {/* Info cliente domicilio */}
        {orderType === 'delivery' && deliveryData && (
          <div className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 space-y-1 sm:space-y-1.5 mb-2.5 sm:mb-3 md:mb-4">
            <div className="flex items-center gap-2">
              <Phone size={14} className="flex-shrink-0 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              <span className="truncate">{deliveryData.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="flex-shrink-0 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              <span className="truncate">{deliveryData.address}</span>
            </div>
          </div>
        )}

        {/* Costo domicilio - FUNCIONAL */}
        {orderType === 'delivery' && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5 md:gap-3 pt-2.5 sm:pt-3 md:pt-4 border-t border-gray-300 dark:border-gray-600">
            <span className="text-xs sm:text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Costo envio:
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={localCost}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                updateDeliveryCost(value);
              }}
              onBlur={(e) => {
                const value = parseFloat(e.target.value) || 0;
                updateDeliveryCost(value);
              }}
              className="w-20 sm:w-24 md:w-28 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-xs sm:text-sm md:text-base focus:ring-2 focus:ring-orange-500 transition-all"
              placeholder="0.00"
            />
            {/* Botones dinamicos */}
            <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2">
              {deliveryPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => updateDeliveryCost(preset)}
                  className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-lg text-xs sm:text-sm md:text-base font-semibold transition-colors hover:shadow-md active:scale-95"
                >
                  ${preset}
                </button>
              ))}
            </div>
            {localCost > 0 && (
              <span className="text-xs sm:text-sm md:text-base text-orange-600 dark:text-orange-400 font-semibold sm:ml-auto">
                ${Number(localCost).toFixed(2)}
              </span>
            )}
          </div>
        )}

        {/* Botón de continuar para delivery */}
        {orderType === 'delivery' && localCost > 0 && onConfirm && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleProceed}
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
            >
              ✅ Continuar comprando
            </button>
          </div>
        )}
      </div>
    );
  };

  export default OrderInfo;

