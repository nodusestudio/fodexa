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
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 px-3 sm:px-6 py-3 sm:py-4 text-white">
          <h2 className="text-lg sm:text-2xl font-bold">🧾 Comprobante de Cierre de Caja</h2>
          <button
            onClick={onClose}
            className="p-1 sm:p-2 hover:bg-blue-500 rounded-full transition-colors"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Contenido del Ticket */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-gray-50 dark:bg-gray-800">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-3 sm:p-8 space-y-3 sm:space-y-6 print:shadow-none">
            {/* Logo y Empresa */}
            <div className="text-center border-b border-gray-300 dark:border-gray-700 pb-3 sm:pb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">🏢</h1>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mt-2">FODEXA POS</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Sistema de Gestión de Caja</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Sesión: <span className="font-bold">{session?.id?.toString().slice(-6) || 'N/A'}</span></p>
            </div>

            {/* Información de Sesión */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm border-b border-gray-300 dark:border-gray-700 pb-3 sm:pb-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400">📅 Apertura</p>
                <p className="font-bold text-gray-800 dark:text-white text-xs">{formatDateTime(session?.openDate)}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">📅 Cierre</p>
                <p className="font-bold text-gray-800 dark:text-white text-xs">{formatDateTime(session?.closeDate)}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">👤 Abierto por</p>
                <p className="font-bold text-gray-800 dark:text-white text-xs sm:text-sm">{session?.openUser || 'Sistema'}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">👤 Cerrado por</p>
                <p className="font-bold text-gray-800 dark:text-white text-xs sm:text-sm">{session?.closeUser || 'Sistema'}</p>
              </div>
            </div>

            {/* Movimientos */}
            <div className="space-y-3 sm:space-y-4 border-b border-gray-300 dark:border-gray-700 pb-3 sm:pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">💰 Monto Inicial</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(session?.initialAmount)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 sm:p-4 border border-blue-200 dark:border-blue-700">
                  <p className="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase">💳 Ventas Totales</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(sales)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{saleCount} venta{saleCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 sm:p-4 border border-red-200 dark:border-red-700">
                  <p className="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase">🗑️ Egresos Totales</p>
                  <p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{formatCurrency(expenses)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{expenseCount} egreso{expenseCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            {/* DESGLOSE DETALLADO POR MEDIO DE PAGO */}
            <div className="border-b border-gray-300 dark:border-gray-700 pb-3 sm:pb-4">
              <p className="font-bold text-gray-800 dark:text-white mb-3 text-xs sm:text-sm">📊 DESGLOSE POR MEDIO DE PAGO</p>
              
              {session?.paymentBreakdown && Object.entries(session.paymentBreakdown).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(session.paymentBreakdown).map(([type, amount]) => {
                    const typeLabels = {
                      'cash': '💵 Efectivo',
                      'card': '🏦 Bancolombia',
                      'transfer': '📱 Transferencia',
                      'nequi': '📱 Nequi',
                      'bold': '💳 Bold',
                      'aliado': '🏪 Aliado',
                      'efectivo': '💵 Efectivo',
                      'bancolombia': '🏦 Bancolombia',
                      'transferencia': '📱 Transferencia'
                    };
                    return (
                      <div key={type} className="bg-blue-50 dark:bg-blue-900/10 p-2 sm:p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex justify-between items-center text-xs sm:text-sm mb-1">
                          <span className="font-bold text-gray-800 dark:text-white">{typeLabels[type] || type}</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">Entró: {formatCurrency(amount)}</span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Salió por egresos: ${
                          sessionMovements
                            .filter(m => m.type === 'expense' && m.metadata?.paymentMethod === type)
                            .reduce((sum, m) => sum + m.amount, 0)
                            .toLocaleString('es-CO')
                        }</div>
                        <div className="text-xs font-semibold text-green-600 dark:text-green-400 mt-1">
                          Saldo final: {formatCurrency(
                            amount - sessionMovements
                              .filter(m => m.type === 'expense' && m.metadata?.paymentMethod === type)
                              .reduce((sum, m) => sum + m.amount, 0)
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-500">Sin desglose disponible</p>
              )}
            </div>

            {/* EGRESOS DETALLADOS */}
            {sessionMovements.filter(m => m.type === 'expense').length > 0 && (
              <div className="border-b border-gray-300 dark:border-gray-700 pb-3 sm:pb-4">
                <p className="font-bold text-gray-800 dark:text-white mb-2 text-xs sm:text-sm">🗑️ EGRESOS DEL DÍA ({sessionMovements.filter(m => m.type === 'expense').length})</p>
                <div className="space-y-1 bg-red-50 dark:bg-red-900/10 p-2 sm:p-3 rounded-lg max-h-[200px] overflow-y-auto">
                  {sessionMovements
                    .filter(m => m.type === 'expense')
                    .map((expense, idx) => (
                      <div key={idx} className="text-xs sm:text-sm border-b border-red-200 dark:border-red-800 pb-1 mb-1 last:border-b-0">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-800 dark:text-white">{expense.description || 'Egreso'}</span>
                          <span className="font-bold text-red-600 dark:text-red-400">-{formatCurrency(expense.amount)}</span>
                        </div>
                        {expense.metadata?.paymentMethod && (
                          <span className="text-xs text-gray-500 dark:text-gray-500">Medio: {expense.metadata.paymentMethod}</span>
                        )}
                      </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 p-2 bg-red-100 dark:bg-red-900/20 rounded font-bold text-xs sm:text-sm">
                  <span>Total Egresos:</span>
                  <span className="text-red-600 dark:text-red-400">
                    {formatCurrency(
                      sessionMovements
                        .filter(m => m.type === 'expense')
                        .reduce((sum, m) => sum + m.amount, 0)
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* RESUMEN FINAL */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-3 sm:p-4 border-l-4 border-purple-600 dark:border-purple-400 space-y-2 sm:space-y-3">
              <h3 className="font-bold text-gray-800 dark:text-white text-xs sm:text-sm mb-2">🧮 RESUMEN DEL CIERRE</h3>
              
              <div className="space-y-1 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Monto Inicial</span>
                  <span className="font-bold text-gray-800 dark:text-white">+ {formatCurrency(session?.initialAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Ventas del Día</span>
                  <span className="font-bold text-green-600 dark:text-green-400">+ {formatCurrency(sales)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Egresos del Día</span>
                  <span className="font-bold text-red-600 dark:text-red-400">- {formatCurrency(expenses)}</span>
                </div>
                
                <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-800 dark:text-white">Debería haber:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(session?.expectedAmount || (session?.initialAmount + sales - expenses))}</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800 dark:text-white text-xs sm:text-sm">Se contó:</span>
                  <span className="font-bold text-gray-800 dark:text-white text-lg sm:text-xl">{formatCurrency(session?.finalCount)}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2 flex justify-between items-center">
                <span className="font-bold text-gray-800 dark:text-white">DIFERENCIA:</span>
                <div className={`text-center px-3 py-2 rounded font-bold ${
                  session?.difference === 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                  session?.difference < 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                  'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                }`}>
                  <p className="text-lg sm:text-2xl">{session?.difference === 0 ? '✅' : session?.difference < 0 ? '❌' : '⚠️'}</p>
                  <p>${Math.abs(session?.difference || 0).toLocaleString('es-CO')}</p>
                  <p className="text-xs font-semibold">{
                    session?.difference === 0 ? 'CUADRE EXACTO' :
                    session?.difference < 0 ? 'FALTA DINERO' : 'SOBRANTE'
                  }</p>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            {session?.observations && (
              <div className="border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20 p-2 sm:p-4 rounded">
                <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white mb-1">Observaciones</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{session.observations}</p>
              </div>
            )}

            {/* Pie de página */}
            <div className="text-center border-t border-gray-300 dark:border-gray-700 pt-2 sm:pt-4 text-xs text-gray-500 dark:text-gray-500 space-y-1">
              <p>Gracias por usar FODEXA POS</p>
              <p>{new Date().toLocaleString('es-CO')}</p>
              <p className="print:hidden text-xs">Este documento es válido como comprobante de cierre de caja</p>
            </div>
          </div>
        </div>

        {/* Footer con Botones */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 sm:px-6 py-3 sm:py-4 flex gap-2 sm:gap-3 justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 sm:py-2 rounded-lg bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium sm:font-semibold transition-colors text-xs sm:text-sm"
          >
            <X size={16} className="inline mr-1 sm:mr-2" />
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="px-3 sm:px-4 py-2 sm:py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium sm:font-semibold transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <Printer size={16} className="sm:w-5 sm:h-5" />
            Imprimir
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
