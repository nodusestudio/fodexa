import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { Edit2, CreditCard, Trash2, Clock, User, MapPin } from 'lucide-react';

const OrderCard = ({ order, onEdit, onPay, onDelete }) => {
  if (!order) return null;

  const getTimeElapsed = (timestamp) => {
    if (!timestamp) return '0 min';
    const mins = Math.floor((new Date() - new Date(timestamp)) / 60000);
    return mins < 60 ? mins + ' min' : Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm';
  };

  const getName = () => {
    if (order.type === 'table') {
      return 'Mesa ' + (order.tableNumber || '?');
    } else if (order.type === 'delivery') {
      return order.deliveryData?.name || 'Domicilio';
    } else {
      return 'Pedido #' + String(order.id).slice(-4);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border-l-4 border-blue-500 p-4 shadow-md hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-gray-800 dark:text-white text-lg">{getName()}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {order.type === 'table' ? '🎯 Mesa' : order.type === 'delivery' ? '🚴 Domicilio' : '🛍️ Llevar'}
            </span>
            <span className="text-xs px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
              {order.status === 'pending' ? '⏳ Pendiente' : order.status === 'preparing' ? '👨‍🍳 Preparando' : order.status === 'ready' ? '✅ Listo' : '💰 Completado'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(order.total || 0)}</p>
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
            <Clock size={14} />
            {getTimeElapsed(order.timestamp)}
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📦 Productos ({(order.items?.length || 0)}):</p>
        <div className="space-y-1 max-h-[150px] overflow-y-auto">
          {order.items && order.items.length > 0 ? (
            order.items.map((item, i) => (
              <div key={i} className="text-xs text-gray-600 dark:text-gray-400 pl-2 border-l-2 border-blue-300">
                <div className="flex justify-between">
                  <span>• {item.quantity}x {item.name}</span>
                  <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                </div>
                {item.addons && item.addons.length > 0 && (
                  <div className="pl-2 text-xs text-gray-500">
                    {item.addons.map((addon, j) => (
                      <div key={j}>+ {addon.name}</div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500">Sin items</p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mb-3 text-sm text-gray-600 dark:text-gray-300">
        {order.type === 'delivery' && order.deliveryData && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1 text-xs">
              <User size={12} />
              <span className="font-semibold">{order.deliveryData.name}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <MapPin size={12} />
              {order.deliveryData.address}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onEdit && onEdit(order)}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-1 text-sm transition-colors"
        >
          <Edit2 size={14} />
          Editar
        </button>
        <button
          onClick={() => onPay && onPay(order)}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-1 text-sm transition-colors"
        >
          <CreditCard size={14} />
          Cobrar
        </button>
        <button
          onClick={() => onDelete && onDelete(order)}
          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
          title="Eliminar"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default OrderCard;