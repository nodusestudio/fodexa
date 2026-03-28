import React from 'react';

function TableOrderInfo({ order, onEdit, onCharge, onCancel }) {
  if (!order) return null;
  const { total, timestamp, items, status } = order;
  const time = new Date(timestamp).toLocaleTimeString();
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
      <h3 className="text-lg font-bold mb-2">Pedido en Mesa</h3>
      <div className="mb-2 text-gray-700">Estado: <span className="font-semibold">{status}</span></div>
      <div className="mb-2 text-gray-700">Hora: <span className="font-semibold">{time}</span></div>
      <div className="mb-2 text-gray-700">Total: <span className="font-bold text-primary-600">${total.toFixed(2)}</span></div>
      <div className="mb-4">
        <ul className="text-sm text-gray-600">
          {items.map(item => (
            <React.Fragment key={item.id}>
              <li className="flex justify-between">
                <span>{item.name} x{item.quantity}</span>
                <span>${((parseFloat(item.price) || 0) * (item.quantity || 1)).toFixed(2)}</span>
              </li>
              {Array.isArray(item.addons) && item.addons.length > 0 && (
                <ul className="ml-4 text-xs text-purple-700">
                  {item.addons.map(addon => (
                    <li key={addon.id} className="flex justify-between">
                      <span>+ {addon.name}</span>
                      <span>${(parseFloat(addon.price) || 0).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </React.Fragment>
          ))}
        </ul>
      </div>
      <div className="flex gap-2">
        <button onClick={onEdit} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">Editar</button>
        <button onClick={onCharge} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">Cobrar</button>
        <button onClick={onCancel} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">Cancelar</button>
      </div>
    </div>
  );
}

export default TableOrderInfo;
