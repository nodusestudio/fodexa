import React, { useRef } from 'react';
import { X, Utensils, Printer } from 'lucide-react';

const KitchenTicketModal = ({ order, onClose }) => {
  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open('', '', 'width=400,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket Cocina - ${order.ticketNumber}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              padding: 20px; 
              font-size: 14px;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px dashed #000; 
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .item { 
              margin-bottom: 15px; 
              padding: 10px;
              border: 1px solid #ddd;
            }
            .item-name { 
              font-weight: bold; 
              font-size: 16px;
              margin-bottom: 5px;
            }
            .notes { 
              background: #fff3cd; 
              padding: 5px; 
              margin-top: 5px;
              font-weight: bold;
            }
            .qty { 
              background: #000; 
              color: #fff; 
              padding: 2px 8px; 
              border-radius: 3px;
              margin-right: 10px;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      onClose();
    }, 250);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Utensils size={28} className="text-orange-600 dark:text-orange-400" />
            🍳 Ticket para Cocina
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Preview del Ticket */}
        <div className="p-6 bg-gray-100 dark:bg-gray-900">
          <div 
            ref={printRef}
            className="bg-white p-6 font-mono"
          >
            {/* Header */}
            <div className="header">
              <h1 className="text-2xl font-bold">COCINA</h1>
              <p>Ticket #{order.ticketNumber}</p>
              <p>{formatDate(order.createdAt)}</p>
              <p>
                {order.orderType === 'table' && `🪑 Mesa ${order.tableNumber}`}
                {order.orderType === 'delivery' && '🚴 DOMICILIO'}
                {order.orderType === 'takeout' && '🛍️ PARA LLEVAR'}
              </p>
            </div>

            {/* Items */}
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="item">
                  <div className="flex items-start">
                    <span className="qty">{item.quantity}x</span>
                    <div className="flex-1">
                      <div className="item-name">{item.name}</div>
                      {item.addons && item.addons.length > 0 && (
                        <div className="text-sm text-gray-600">
                          {item.addons.map((addon, aidx) => (
                            <div key={aidx}>+ {addon.name}</div>
                          ))}
                        </div>
                      )}
                      {item.notes && (
                        <div className="notes">
                          ⚠️ {item.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 text-center border-t border-gray-300 pt-4">
              <p className="text-sm">¡Gracias!</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Printer size={20} />
            Imprimir para Cocina
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default KitchenTicketModal;
