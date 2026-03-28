import React from 'react';

function TableOrderInfo({ order, onEdit, onCharge, onCancel }) {
  if (!order) return null;
  const { total, timestamp, items, status } = order;
  const time = new Date(timestamp).toLocaleTimeString();
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl p-3 sm:p-4 md:p-6 lg:p-8 w-full max-w-md transition-shadow">
      <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 md:mb-4 text-gray-800 dark:text-white">Pedido en Mesa</h3>
      <div className="mb-2 text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300">
        Estado: <span className="font-semibold text-blue-600 dark:text-blue-400">{status}</span>
      </div>
      <div className="mb-2 text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300">
        Hora: <span className="font-semibold">{time}</span>
      </div>
      <div className="mb-3 sm:mb-4 md:mb-5 text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300">
        Total: <span className="font-bold text-lg sm:text-xl md:text-2xl text-blue-600 dark:text-blue-400">${total.toFixed(2)}</span>
      </div>
      <div className="mb-4 sm:mb-5 md:mb-6">
        <ul className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 space-y-1 sm:space-y-1.5">
          {items.map(item => (
            <React.Fragment key={item.id}>
              <li className="flex justify-between">
                <span className="truncate">{item.name} x{item.quantity}</span>
                <span className="font-medium ml-2 flex-shrink-0">${((parseFloat(item.price) || 0) * (item.quantity || 1)).toFixed(2)}</span>
              </li>
              {Array.isArray(item.addons) && item.addons.length > 0 && (
                <ul className="ml-3 sm:ml-4 text-xs text-purple-600 dark:text-purple-400 space-y-0.5">
                  {item.addons.map(addon => (
                    <li key={addon.id} className="flex justify-between">
                      <span className="truncate">+ {addon.name}</span>
                      <span className="ml-2 flex-shrink-0">${(parseFloat(addon.price) || 0).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </React.Fragment>
          ))}
        </ul>
      </div>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3">
        <button 
          onClick={onEdit} 
          className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-2 sm:px-4 py-1.5 sm:py-2 md:py-3 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition-colors shadow-md hover:shadow-lg"
        >
          <span className="hidden sm:inline">Editar</span>
          <span className="inline sm:hidden">✏️</span>
        </button>
        <button 
          onClick={onCharge} 
          className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white px-2 sm:px-4 py-1.5 sm:py-2 md:py-3 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition-colors shadow-md hover:shadow-lg"
        >
          <span className="hidden sm:inline">Cobrar</span>
          <span className="inline sm:hidden">💰</span>
        </button>
        <button 
          onClick={onCancel} 
          className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white px-2 sm:px-4 py-1.5 sm:py-2 md:py-3 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition-colors shadow-md hover:shadow-lg"
        >
          <span className="hidden sm:inline">Cancelar</span>
          <span className="inline sm:hidden">❌</span>
        </button>
      </div>
    </div>
  );
}

export default TableOrderInfo;
