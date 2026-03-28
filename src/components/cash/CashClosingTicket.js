import React, { useState, useEffect } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { useCash } from '../../context/CashContext';

function CashClosingTicket({ isOpen, onClose, sessionId }) {
  const { getSessionById, cashMovements } = useCash();
  const [session, setSession] = useState(null);
  const [sessionMovements, setSessionMovements] = useState([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState({});

  useEffect(() => {
    if (isOpen && sessionId) {
      const foundSession = getSessionById(sessionId);
      setSession(foundSession);

      if (foundSession) {
        // Filtrar movimientos de esta sesión
        const relevantMovements = cashMovements.filter(
          m => new Date(m.date) >= new Date(foundSession.openDate) &&
               new Date(m.date) <= new Date(foundSession.closeDate || new Date())
        );
        setSessionMovements(relevantMovements);

        // Calcular desglose por tipo de pago desde las descripciones
        const breakdown = {};
        relevantMovements
          .filter(m => m.type === 'sale')
          .forEach(m => {
            const types = m.description.match(/efectivo|tarjeta|transferencia/gi) || [];
            types.forEach(type => {
              const normalizedType = type.toLowerCase();
              if (!breakdown[normalizedType]) {
                breakdown[normalizedType] = 0;
              }
              breakdown[normalizedType] += m.amount;
            });
          });
        setPaymentBreakdown(breakdown);
      }
    }
  }, [isOpen, sessionId, getSessionById, cashMovements]);

  if (!isOpen || !session) return null;

  const sales = sessionMovements
    .filter(m => m.type === 'sale')
    .reduce((sum, m) => sum + m.amount, 0);

  const expenses = sessionMovements
    .filter(m => m.type === 'expense')
    .reduce((sum, m) => sum + m.amount, 0);

  const saleCount = sessionMovements.filter(m => m.type === 'sale').length;
  const expenseCount = sessionMovements.filter(m => m.type === 'expense').length;

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const differenceStatus = session.difference < 0 ? '❌ FALTANTE' : session.difference > 0 ? '✅ SOBRANTE' : '✅ CUADRE EXACTO';
  const differenceColor = session.difference < 0 ? 'text-red-600' : session.difference > 0 ? 'text-green-600' : 'text-blue-600';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 px-6 py-4 text-white">
          <h2 className="text-2xl font-bold">🧾 Ticket de Cierre de Caja</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-500 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido del Ticket */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 space-y-6 print:shadow-none">
            {/* Logo y Empresa */}
            <div className="text-center border-b border-gray-300 dark:border-gray-700 pb-4">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">🏢</h1>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mt-2">FODEXA POS</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sistema de Gestión de Caja</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Sesión: <span className="font-bold">{session?.id?.toString().slice(-6) || 'N/A'}</span></p>
            </div>

            {/* Información de Sesión */}
            <div className="grid grid-cols-2 gap-4 text-sm border-b border-gray-300 dark:border-gray-700 pb-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Apertura</p>
                <p className="font-bold text-gray-800 dark:text-white text-xs">{formatDateTime(session?.openDate)}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Cierre</p>
                <p className="font-bold text-gray-800 dark:text-white text-xs">{formatDateTime(session?.closeDate)}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Abierto por</p>
                <p className="font-bold text-gray-800 dark:text-white">{session?.openUser || 'Sistema'}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Cerrado por</p>
                <p className="font-bold text-gray-800 dark:text-white">{session?.closeUser || 'Sistema'}</p>
              </div>
            </div>

            {/* Movimientos */}
            <div className="space-y-4 border-b border-gray-300 dark:border-gray-700 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Monto Inicial</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(session?.initialAmount)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <p className="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase">📈 Ventas Totales</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(sales)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{saleCount} venta{saleCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
                  <p className="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase">📉 Egresos Totales</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{formatCurrency(expenses)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{expenseCount} egreso{expenseCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            {/* Desglose por Tipo de Pago */}
            {(session?.paymentBreakdown && Object.keys(session.paymentBreakdown).length > 0) && (
              <div className="border-b border-gray-300 dark:border-gray-700 pb-4">
                <p className="font-bold text-gray-800 dark:text-white mb-3 text-sm">💳 DESGLOSE POR TIPO DE PAGO</p>
                <div className="space-y-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  {Object.entries(session.paymentBreakdown).map(([type, amount]) => {
                    const typeLabels = {
                      'cash': '💵 Efectivo',
                      'card': '💳 Tarjeta',
                      'transfer': '📱 Transferencia',
                      'efectivo': '💵 Efectivo',
                      'tarjeta': '💳 Tarjeta',
                      'transferencia': '📱 Transferencia'
                    };
                    return (
                      <div key={type} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">{typeLabels[type] || type}</span>
                        <span className="font-bold text-gray-800 dark:text-white">{formatCurrency(amount)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Egresos en Efectivo */}
            {session?.expensesInCash > 0 && (
              <div className="border-b border-gray-300 dark:border-gray-700 pb-4">
                <p className="font-bold text-gray-800 dark:text-white mb-2 text-sm">💸 EGRESOS EN EFECTIVO</p>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Total Egresos</span>
                    <span className="font-bold text-red-600 dark:text-red-400">{formatCurrency(session.expensesInCash)}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{session?.expenseCount || 0} egreso{(session?.expenseCount || 0) !== 1 ? 's' : ''}</p>
                </div>
              </div>
            )}

            {/* Cuadre de Caja */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border-l-4 border-purple-600 dark:border-purple-400 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Inicial + Ventas - Egresos</span>
                <span className="font-bold text-gray-800 dark:text-white">{formatCurrency(session?.expectedAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Monto Contado</span>
                <span className="font-bold text-gray-800 dark:text-white">{formatCurrency(session?.finalCount)}</span>
              </div>
              <div className="border-t border-gray-300 dark:border-gray-600 pt-3 flex justify-between">
                <span className="font-bold text-gray-800 dark:text-white">Diferencia</span>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${differenceColor}`}>{formatCurrency(Math.abs(session?.difference))}</p>
                  <p className={`text-xs font-semibold ${differenceColor}`}>{differenceStatus}</p>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            {session?.observations && (
              <div className="border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20 p-4 rounded">
                <p className="text-sm font-bold text-gray-800 dark:text-white mb-1">📝 Observaciones</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{session.observations}</p>
              </div>
            )}

            {/* Pie de página */}
            <div className="text-center border-t border-gray-300 dark:border-gray-700 pt-4 text-xs text-gray-500 dark:text-gray-500 space-y-1">
              <p>Gracias por usar FODEXA POS</p>
              <p>{new Date().toLocaleString('es-CO')}</p>
              <p className="print:hidden">Este documento es válido como comprobante de cierre de caja</p>
            </div>
          </div>
        </div>

        {/* Footer con Botones */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-6 py-4 flex gap-3 justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold transition-colors"
          >
            <X size={18} className="inline mr-2" />
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold transition-colors flex items-center gap-2"
          >
            <Printer size={18} />
            Imprimir Ticket
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .fixed {
            position: static;
          }
          .bg-black.bg-opacity-50 {
            background: none;
          }
          .rounded-2xl {
            border-radius: 0;
          }
          .max-h-\\[90vh\\] {
            max-height: 100%;
          }
          .flex.flex-col {
            display: block;
          }
          .overflow-y-auto {
            overflow: visible;
          }
        }
      `}</style>
    </div>
  );
}

export default CashClosingTicket;
