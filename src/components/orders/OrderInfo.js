
import React, { useState, useEffect, useMemo } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useOrder } from '../../context/OrderContext';
import { Bike, Phone, MapPin, X } from 'lucide-react';

const OrderInfo = ({ orderType, tableNumber, deliveryData, onClear }) => {
  const { setDeliveryData } = useOrder();
  const { settings } = useSettings();
  // Estado local para el input de costo
  const [localCost, setLocalCost] = useState(deliveryData?.cost || 0);
  // Presets dinÃ¡micos desde configuraciÃ³n
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

  return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 md:p-4 mb-3 md:mb-4 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            {orderType === 'table' && (
              <>
                <span className="text-xl md:text-2xl">ðŸª‘</span>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white">Mesa {tableNumber}</h3>
                </div>
              </>
            )}
          
            {orderType === 'delivery' && (
              <>
                <Bike size={20} className="text-orange-600 dark:text-orange-400" />
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white">Domicilio</h3>
                  {deliveryData?.name && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{deliveryData.name}</p>
                  )}
                </div>
              </>
            )}
          
            {orderType === 'takeout' && (
              <>
                <span className="text-xl md:text-2xl">ðŸ›ï¸</span>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white">Para Llevar</h3>
                </div>
              </>
            )}
          </div>
        
          <button onClick={onClear} className="text-gray-400 hover:text-red-500">
            <X size={20} />
          </button>
        </div>

        {/* Info cliente domicilio */}
        {orderType === 'delivery' && deliveryData && (
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-3">
            <div className="flex items-center gap-2">
              <Phone size={14} />
              {deliveryData.phone}
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              {deliveryData.address}
            </div>
          </div>
        )}

        {/* Costo domicilio - FUNCIONAL */}
        {orderType === 'delivery' && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-3 border-t border-gray-300 dark:border-gray-600">
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Costo envÃ­o:
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
              className="w-24 sm:w-32 px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-orange-500"
              placeholder="0.00"
            />
            {/* Botones dinámicos */}
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {deliveryPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => updateDeliveryCost(preset)}
                  className="px-2 sm:px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-semibold transition-colors"
                >
                  ${preset}
                </button>
              ))}
            </div>
            {localCost > 0 && (
              <span className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 font-semibold ml-auto">
                ${Number(localCost).toFixed(2)}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  export default OrderInfo;

