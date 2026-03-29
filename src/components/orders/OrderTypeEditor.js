import React, { useState } from 'react';
import { X, Table, ShoppingBag, Bike } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';
import tables from '../../data/tables';

const OrderTypeEditor = ({ isOpen, onClose, currentOrderType, selectedTable, deliveryData }) => {
  const { setOrderType, selectTable, setDeliveryData, orders } = useOrder();
  const [tempOrderType, setTempOrderType] = useState(currentOrderType);
  const [tempTable, setTempTable] = useState(selectedTable);
  const [tempDeliveryData, setTempDeliveryData] = useState(deliveryData || { name: '', phone: '', address: '', cost: 0 });

  const getTableStatus = (table) => {
    const order = orders.find(
      o => o.type === 'table' && o.tableNumber === table.id && o.status !== 'completed'
    );
    if (order) return 'occupied';
    return table.status;
  };

  const handleSave = () => {
    if (tempOrderType === 'table' && !tempTable) {
      alert('⚠️ Seleccione una mesa');
      return;
    }
    if (tempOrderType === 'delivery' && !tempDeliveryData.name) {
      alert('⚠️ Ingrese nombre del cliente');
      return;
    }

    // Actualizar contexto
    setOrderType(tempOrderType);
    if (tempOrderType === 'table') {
      selectTable(tempTable);
    }
    if (tempOrderType === 'delivery') {
      setDeliveryData(tempDeliveryData);
    }

    onClose();
  };

  if (!isOpen) return null;

  const orderTypes = [
    { key: 'table', label: 'Mesa', icon: Table, color: 'blue' },
    { key: 'takeout', label: 'Para Llevar', icon: ShoppingBag, color: 'green' },
    { key: 'delivery', label: 'Domicilio', icon: Bike, color: 'orange' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl w-full md:w-96 max-h-[80vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white p-4 md:p-6 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
            <span>⚙️</span> Cambiar Tipo de Pedido
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-500 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Tipo de Pedido */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <span>📋</span> Tipo de Pedido
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {orderTypes.map(({ key, label, icon: Icon, color }) => {
                const bgColors = {
                  blue: 'bg-blue-500 hover:bg-blue-600',
                  green: 'bg-green-500 hover:bg-green-600',
                  orange: 'bg-orange-500 hover:bg-orange-600',
                };
                const ringColors = {
                  blue: 'ring-4 ring-blue-300',
                  green: 'ring-4 ring-green-300',
                  orange: 'ring-4 ring-orange-300',
                };
                const isSelected = tempOrderType === key;

                return (
                  <button
                    key={key}
                    onClick={() => {
                      setTempOrderType(key);
                      if (key !== 'table') setTempTable(null);
                    }}
                    className={`py-3 px-2 rounded-lg text-white font-semibold flex flex-col items-center gap-2 transition-all ${bgColors[color]} ${
                      isSelected ? ringColors[color] : ''
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs md:text-sm">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mesa Selector - solo si es table */}
          {tempOrderType === 'table' && (
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <span>🪑</span> Seleccionar Mesa
              </h3>
              <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
                {tables.map((table) => {
                  const status = getTableStatus(table);
                  const isSelected = tempTable === table.id;
                  const isDisabled = status !== 'available';

                  let bgColor = 'bg-green-500 hover:bg-green-600';
                  let textColor = 'text-white';

                  if (status === 'occupied') {
                    bgColor = 'bg-red-500 opacity-50 cursor-not-allowed';
                  } else if (status === 'reserved') {
                    bgColor = 'bg-amber-500 opacity-50 cursor-not-allowed';
                  }

                  return (
                    <button
                      key={table.id}
                      onClick={() => !isDisabled && setTempTable(table.id)}
                      disabled={isDisabled}
                      className={`
                        relative
                        aspect-square
                        rounded-lg
                        font-bold text-sm
                        transition-all duration-200
                        flex flex-col items-center justify-center gap-1
                        shadow-sm
                        border-2 border-transparent
                        ${bgColor}
                        ${textColor}
                        ${isSelected ? 'ring-4 ring-blue-400 scale-105' : ''}
                      `}
                    >
                      <span className="text-xl">.{table.id}</span>
                      <span className="text-xs opacity-90">${table.capacity}</span>
                    </button>
                  );
                })}
              </div>
              {tempTable && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-3">
                  ✅ Mesa #{tempTable} seleccionada
                </p>
              )}
            </div>
          )}

          {/* Delivery Data - solo si es delivery */}
          {tempOrderType === 'delivery' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <span>📍</span> Datos de Entrega
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre del Cliente
                </label>
                <input
                  type="text"
                  value={tempDeliveryData.name || ''}
                  onChange={(e) =>
                    setTempDeliveryData({ ...tempDeliveryData, name: e.target.value })
                  }
                  placeholder="Ej: Juan García"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={tempDeliveryData.phone || ''}
                  onChange={(e) =>
                    setTempDeliveryData({ ...tempDeliveryData, phone: e.target.value })
                  }
                  placeholder="Ej: +58 412 1234567"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dirección
                </label>
                <textarea
                  value={tempDeliveryData.address || ''}
                  onChange={(e) =>
                    setTempDeliveryData({ ...tempDeliveryData, address: e.target.value })
                  }
                  placeholder="Ej: Calle Principal 123, Apto 4B"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Costo de Entrega
                </label>
                <input
                  type="number"
                  value={tempDeliveryData.cost || 0}
                  onChange={(e) =>
                    setTempDeliveryData({ ...tempDeliveryData, cost: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="Ej: 5000"
                  step="1000"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Para Llevar - sin opciones adicionales */}
          {tempOrderType === 'takeout' && (
            <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg">
              <p className="text-green-800 dark:text-green-200 text-sm">
                ✅ Pedido para llevar seleccionado
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 md:p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
          >
            ✅ Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTypeEditor;
