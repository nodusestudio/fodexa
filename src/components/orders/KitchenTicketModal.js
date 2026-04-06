import React, { useRef, useContext } from 'react';
import { X, Utensils, Printer } from 'lucide-react';
import { SettingsContext } from '../../context/SettingsContext';

const KitchenTicketModal = ({ order, onClose }) => {
  const { settings } = useContext(SettingsContext);
  const printRef = useRef();

  // Valores por defecto para botón de cocina
  const defaultKitchenButton = {
    buttonText: '🔔 Cocina',
    buttonColor: '#f97316',
    ticketTitle: '🍳 COCINA',
    showTableInfo: true,
    showPhone: true,
    showNotes: true,
    showAddons: true,
    paperWidth: 80,
    headerText: '',
    footerText: '',
    showTimestamp: true,
    separatorCharacter: '-'
  };

  // Obtener valores de configuración
  const kitchenButton = settings?.kitchenButton || defaultKitchenButton;
  const ticketTitle = kitchenButton?.ticketTitle ?? defaultKitchenButton.ticketTitle;
  const headerText = kitchenButton?.headerText ?? defaultKitchenButton.headerText;
  const footerText = kitchenButton?.footerText ?? defaultKitchenButton.footerText;
  const showTableInfo = kitchenButton?.showTableInfo ?? defaultKitchenButton.showTableInfo;
  const showPhone = kitchenButton?.showPhone ?? defaultKitchenButton.showPhone;
  const showNotes = kitchenButton?.showNotes ?? defaultKitchenButton.showNotes;
  const showAddons = kitchenButton?.showAddons ?? defaultKitchenButton.showAddons;
  const showTimestamp = kitchenButton?.showTimestamp ?? defaultKitchenButton.showTimestamp;
  const separatorCharacter = kitchenButton?.separatorCharacter ?? defaultKitchenButton.separatorCharacter;

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
    if (!date) return 'N/A';
    try {
      if (typeof date === 'number') {
        return new Date(date).toLocaleString('es-CO', {
          dateStyle: 'short',
          timeStyle: 'short',
        });
      } else if (date.toDate) {
        return date.toDate().toLocaleString('es-CO', {
          dateStyle: 'short',
          timeStyle: 'short',
        });
      } else {
        return new Date(date).toLocaleString('es-CO', {
          dateStyle: 'short',
          timeStyle: 'short',
        });
      }
    } catch (e) {
      return 'N/A';
    }
  };

  const getOrderType = () => {
    if (order.type === 'table') return `🪑 MESA ${order.tableNumber || '?'}`;
    if (order.type === 'delivery') return `🚚 DOMICILIO - ${order.deliveryData?.name || 'Cliente'}`;
    if (order.type === 'takeout') return `🛍️ PARA LLEVAR`;
    return 'PEDIDO';
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
              {headerText && (
                <div style={{marginBottom: '10px', whiteSpace: 'pre-wrap', fontSize: '12px', fontWeight: 'bold'}}>
                  {headerText}
                </div>
              )}
              <h1 className="text-2xl font-bold" style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '10px'}}>
                {ticketTitle}
              </h1>
              <div style={{borderBottom: '2px dashed #000', paddingBottom: '10px', marginBottom: '15px'}}>
                {separatorCharacter.repeat(30)}
              </div>
              {showTableInfo && (
                <p className="text-lg font-bold" style={{marginTop: '5px', marginBottom: '5px', fontSize: '14px'}}>
                  {getOrderType()}
                </p>
              )}
              {showTimestamp && (
                <p style={{fontSize: '12px', color: '#666'}}>
                  📅 {formatDate(order.timestamp || order.createdAt)}
                </p>
              )}
              {showPhone && order.type === 'delivery' && order.deliveryData?.phone && (
                <p style={{fontSize: '12px', color: '#666'}}>
                  📞 {order.deliveryData.phone}
                </p>
              )}
            </div>

            {/* Items - FORMATO SIMPLE Y CLARO */}
            <div className="space-y-3" style={{marginTop: '15px'}}>
              <div style={{borderBottom: '2px dashed #000', paddingBottom: '10px', marginBottom: '15px', textAlign: 'center', fontSize: '11px', color: '#666'}}>
                {separatorCharacter.repeat(30)}
              </div>
              {order.items && order.items.length > 0 ? order.items.map((item, idx) => (
                <div key={idx} className="item" style={{borderLeft: '4px solid #ff8c00', paddingLeft: '12px', marginBottom: '10px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                    <div>
                      <div className="item-name" style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '5px'}}>
                        {item.quantity}x {item.name}
                      </div>
                      {showAddons && item.addons && item.addons.length > 0 && (
                        <div style={{fontSize: '11px', color: '#666', marginLeft: '0px'}}>
                          {item.addons.map((addon, aidx) => (
                            <div key={aidx} style={{marginTop: '2px'}}>
                              + {addon.name} {addon.quantity && `(${addon.quantity})`}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {showNotes && item.notes && (
                    <div className="notes" style={{marginTop: '8px', backgroundColor: '#fff3cd', padding: '8px', borderLeft: '3px solid #ff6b6b', fontWeight: 'bold', color: '#d32f2f', fontSize: '11px'}}>
                      ⚠️ NOTA: {item.notes}
                    </div>
                  )}
                </div>
              )) : (
                <p style={{color: '#999', textAlign: 'center', fontSize: '12px'}}>Sin items</p>
              )}
            </div>

            {/* Separator */}
            <div style={{borderBottom: '2px dashed #000', paddingTop: '15px', marginTop: '15px', marginBottom: '15px', textAlign: 'center', fontSize: '11px', color: '#666'}}>
              {separatorCharacter.repeat(30)}
            </div>

            {/* Footer */}
            <div className="mt-4 text-center" style={{marginTop: '10px', paddingTop: '10px'}}>
              {footerText && (
                <div style={{fontSize: '12px', fontWeight: 'bold', marginBottom: '10px', whiteSpace: 'pre-wrap'}}>
                  {footerText}
                </div>
              )}
              {!footerText && (
                <>
                  <p style={{fontSize: '13px', fontWeight: 'bold'}}>✅ ¡GRACIAS!</p>
                  <p style={{fontSize: '11px', color: '#888', marginTop: '5px'}}>Tiempo estimado: 15 min</p>
                </>
              )}
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
