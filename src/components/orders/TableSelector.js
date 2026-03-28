import React from 'react';
import { Users, MapPin, Utensils, Coffee, Sun } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';

const TableSelector = ({ tables, selectedTable, onSelectTable }) => {
  const { orders } = useOrder();
  
  const getTableStatus = (table) => {
    const order = orders.find(
      o => o.type === 'table' && o.tableNumber === table.id && o.status !== 'completed'
    );
    if (order) return 'occupied';
    return table.status;
  };

  if (!tables || tables.length === 0) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-500 rounded-lg p-2 md:p-4 mb-4">
        <p className="text-yellow-800 dark:text-yellow-200 font-semibold text-sm">^ Sin mesas</p>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
        <span>^</span> Seleccionar Mesa
      </h3>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
        {tables.map((table) => {
          const status = getTableStatus(table);
          const isSelected = selectedTable === table.id;
          const isDisabled = status !== 'available';
          
          let bgColor = 'bg-green-500 hover:bg-green-600';
          let textColor = 'text-white';
          
          if (status === 'occupied') {
            bgColor = 'bg-red-500 opacity-50 cursor-not-allowed';
            textColor = 'text-white';
          } else if (status === 'reserved') {
            bgColor = 'bg-amber-500 opacity-50 cursor-not-allowed';
            textColor = 'text-white';
          }

          return (
            <button
              key={table.id}
              onClick={() => !isDisabled && onSelectTable(table.id)}
              disabled={isDisabled}
              className={`
                relative
                w-full aspect-square
                rounded-lg md:rounded-xl
                font-bold text-sm md:text-base
                transition-all duration-200
                flex flex-col items-center justify-center gap-1
                shadow-sm
                border-2 border-transparent
                ${bgColor}
                ${textColor}
                ${isSelected ? 'ring-4 ring-blue-400 scale-105' : ''}
              `}
            >
              <span className="text-lg md:text-2xl">#{table.id}</span>
              <span className="text-xs md:text-sm opacity-90 leading-tight">
                ${table.capacity}
              </span>
              
              {status === 'occupied' && (
                <span className="absolute top-1 right-1 text-xs">^</span>
              )}
              {status === 'reserved' && (
                <span className="absolute top-1 right-1 text-xs">^</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TableSelector;
