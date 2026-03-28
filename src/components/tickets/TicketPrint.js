import React, { useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/formatters';
import { Printer, X } from 'lucide-react';

const TicketPrint = ({ ticket, onClose }) => {
  const { settings } = useSettings();
  const companyData = settings.company;
  const ticketConfig = settings.ticket;
  const taxesConfig = settings.taxes;
  const currencyConfig = settings.currency;
  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open('', '', 'width=300,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>${ticket.ticketNumber}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 10px; font-size: 12px; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .border-top { border-top: 1px dashed #000; margin: 10px 0; padding-top: 10px; }
            .border-bottom { border-bottom: 1px dashed #000; margin: 10px 0; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 2px 0; }
            @media print {
              body { padding: 0; }
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
    }, 250);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  // Calcular IVA y totales usando settings.taxes
  const taxEnabled = taxesConfig && taxesConfig.enabled === true;
  const taxValue = taxesConfig && taxesConfig.value ? parseFloat(taxesConfig.value) : 0;
  const useDecimals = !!currencyConfig.decimals;
  const currencyCode = currencyConfig.code || 'COP';

  // Usar los valores del ticket si existen, si no calcular
  const subtotal = ticket.subtotal ?? 0;
  const iva = taxEnabled && taxValue > 0 ? (typeof ticket.iva === 'number' ? ticket.iva : subtotal * (taxValue / 100)) : 0;
  const deliveryCost = ticket.deliveryCost ?? 0;
  const total = typeof ticket.total === 'number' ? ticket.total : (subtotal + (taxEnabled ? iva : 0) + deliveryCost);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Printer size={24} className="text-blue-600 dark:text-blue-400" />
            Imprimir Ticket
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Ticket Preview */}
        <div className="p-4 bg-gray-100 dark:bg-gray-900">
          <div 
            ref={printRef}
            className="bg-white text-black p-4 font-mono text-sm"
            style={{ maxWidth: '300px', margin: '0 auto' }}
          >
            {/* Empresa */}
            <div className="text-center border-bottom pb-2">
              {ticketConfig.showLogo && companyData.logo && (
                <img src={companyData.logo} alt="Logo" className="w-20 h-20 mx-auto mb-2" />
              )}
              {ticketConfig.showCompanyName && <h2 className="font-bold text-xl mb-1">{companyData.name}</h2>}
              {companyData.address && <div>{companyData.address}</div>}
              {companyData.city && <div>{companyData.city}</div>}
              {companyData.nit && <div>NIT: {companyData.nit}</div>}
              {companyData.phone && <div>Tel: {companyData.phone}</div>}
              {companyData.email && <div>{companyData.email}</div>}
            </div>

            {/* Info Ticket */}
            <div className="border-bottom py-2">
              {ticketConfig.showTicketNumber && (
                <div className="flex justify-between">
                  <span>Ticket:</span>
                  <span className="font-bold">{ticket.ticketNumber}</span>
                </div>
              )}
              {ticketConfig.showDateTime && (
                <div className="flex justify-between">
                  <span>Fecha:</span>
                  <span>{formatDate(ticket.createdAt)}</span>
                </div>
              )}
              {ticket.employee && (
                <div className="flex justify-between">
                  <span>Empleado:</span>
                  <span>{ticket.employee}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tipo:</span>
                <span>
                  {ticket.orderType === 'table' && `Mesa ${ticket.tableNumber}`}
                  {ticket.orderType === 'takeout' && 'Para Llevar'}
                  {ticket.orderType === 'delivery' && 'Domicilio'}
                </span>
              </div>
              {/* Datos de domicilio si aplica */}
              {ticket.orderType === 'delivery' && (ticket.deliveryData || ticket.customer) && (
                (() => {
                  const data = ticket.deliveryData || ticket.customer;
                  return <>
                    {data.name && (
                      <div className="flex justify-between">
                        <span>Cliente:</span>
                        <span>{data.name}</span>
                      </div>
                    )}
                    {data.address && (
                      <div className="flex justify-between">
                        <span>Dirección:</span>
                        <span>{data.address}</span>
                      </div>
                    )}
                    {data.phone && (
                      <div className="flex justify-between">
                        <span>Tel:</span>
                        <span>{data.phone}</span>
                      </div>
                    )}
                    {data.reference && (
                      <div className="flex justify-between">
                        <span>Referencia:</span>
                        <span>{data.reference}</span>
                      </div>
                    )}
                  </>;
                })()
              )}
            </div>

            {/* Items */}
            <div className="border-bottom py-2">
              <table style={{ width: '100%' }}>
                <tbody>
                  {ticket.items.map((item, idx) => {
                    const addonsTotal = item.addons?.reduce((sum, a) => sum + a.price, 0) || 0;
                    const itemTotal = (item.price * item.quantity) + addonsTotal;
                    return (
                      <React.Fragment key={idx}>
                        <tr>
                          <td style={{ width: 30 }}>{item.quantity}x</td>
                          <td className="text-left" style={{ width: 120 }}>{item.name}</td>
                          <td className="text-right" style={{ width: 70 }}>{formatCurrency(itemTotal, currencyCode, useDecimals)}</td>
                        </tr>
                        {item.addons && item.addons.length > 0 && (
                          <tr>
                            <td></td>
                            <td colSpan="2" className="pl-4 text-xs text-gray-600">
                              {item.addons.map((addon, aidx) => (
                                <div key={aidx} className="flex justify-between">
                                  <span>+ {addon.name}</span>
                                  <span>{formatCurrency(addon.price, currencyCode, useDecimals)}</span>
                                </div>
                              ))}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totales */}
            <div className="border-bottom py-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal, currencyCode, useDecimals)}</span>
              </div>
              {taxEnabled && taxValue > 0 && iva > 0 && (
                <div className="flex justify-between">
                  <span>Impuesto ({taxValue}%):</span>
                  <span>{formatCurrency(iva, currencyCode, useDecimals)}</span>
                </div>
              )}
              {deliveryCost > 0 && (
                <div className="flex justify-between">
                  <span>Domicilio:</span>
                  <span>{formatCurrency(deliveryCost, currencyCode, useDecimals)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg mt-2">
                <span>TOTAL:</span>
                <span>{formatCurrency(total, currencyCode, useDecimals)}</span>
              </div>
              {/* Mostrar efectivo y cambio si existen */}
              {ticket.paymentType && (
                <div className="flex justify-between mt-1">
                  <span>Pago:</span>
                  <span className="capitalize">{ticket.paymentType}</span>
                </div>
              )}
              {ticket.cashReceived && (
                <div className="flex justify-between mt-1">
                  <span>Efectivo:</span>
                  <span>{formatCurrency(ticket.cashReceived, currencyCode, useDecimals)}</span>
                </div>
              )}
              {ticket.change && (
                <div className="flex justify-between mt-1">
                  <span>Cambio:</span>
                  <span>{formatCurrency(ticket.change, currencyCode, useDecimals)}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-600 mt-2">
              <p>{companyData.footer || 'Gracias por preferirnos'}</p>
              <p className="mt-1">{companyData.name ? companyData.name : ''}</p>
              <p className="mt-2">{formatDate(ticket.createdAt)} {ticket.ticketNumber && `#${ticket.ticketNumber}`}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Printer size={20} />
            Imprimir Ticket
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

export default TicketPrint;
