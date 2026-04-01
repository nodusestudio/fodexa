import React, { useState, useEffect, useMemo } from 'react';
import { useCash } from '../../context/CashContext';
import { useTickets } from '../../context/TicketContext';
import { Lock, X, Plus, Trash2, Clock, TrendingUp } from 'lucide-react';

const CashClosing = ({ onClose }) => {
  const { cashSession, closeCash, cashMovements, calculateDeliveryExpenses } = useCash();
  const { tickets } = useTickets();
  const [finalCount, setFinalCount] = useState('');
  const [observations, setObservations] = useState('');
  const [showPaymentBreakdown, setShowPaymentBreakdown] = useState(true);

  const closeTime = new Date();

  // ✅ Calcular egreso automático de domicilios
  const deliveryExpenses = useMemo(() => {
    return calculateDeliveryExpenses(tickets);
  }, [tickets, cashSession, calculateDeliveryExpenses]);

  // ✅ PHASE 5: Calcular duración de sesión
  const sessionDuration = useMemo(() => {
    if (!cashSession) return null;
    const openDate = new Date(cashSession.openDate);
    const diffMs = closeTime - openDate;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes, totalMinutes: Math.floor(diffMs / (1000 * 60)) };
  }, [cashSession, closeTime]);

  // ✅ Calcular egresos por tipo de pago (incluyendo domicilios automáticos)
  const expensesByPaymentType = useMemo(() => {
    const breakdown = {
      efectivo: 0,
      bancolombia: 0,
      nequi: 0,
    };

    // Incluir todos los movimientos de gasto, incluyendo domicilios ya registrados
    cashMovements.forEach(movement => {
      if (movement.type === 'expense') {
        const paymentType = movement.paymentType || 'efectivo';
        if (breakdown.hasOwnProperty(paymentType)) {
          breakdown[paymentType] += movement.amount;
        }
      }
    });

    return breakdown;
  }, [cashMovements]);

  const totalExpensesByType = Object.values(expensesByPaymentType).reduce((a, b) => a + b, 0);
  const paymentBreakdown = useMemo(() => {
    const breakdown = {
      cash: 0,
      card: 0,
      transfer: 0,
      other: 0,
    };

    tickets.forEach(ticket => {
      if (new Date(ticket.createdAt) >= new Date(cashSession?.openDate) && ticket.status === 'completed') {
        const amount = ticket.total || 0;
        switch (ticket.paymentType) {
          case 'cash':
            breakdown.cash += amount;
            break;
          case 'card':
            breakdown.card += amount;
            break;
          case 'transfer':
            breakdown.transfer += amount;
            break;
          default:
            breakdown.other += amount;
        }
      }
    });

    return breakdown;
  }, [tickets, cashSession]);

  const totalPayments = Object.values(paymentBreakdown).reduce((a, b) => a + b, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!finalCount || parseFloat(finalCount) < 0) {
      alert('⚠️ Ingresa un conteo final válido');
      return;
    }

    const closedSession = closeCash(finalCount, observations, []);
    
    if (closedSession && closedSession.id) {
      console.log('💾 Sesión cerrada, ID:', closedSession.id);
      
      // ✅ PHASE 5: Generar ticket de cierre automático
      const closingTicket = {
        id: `closing_${closedSession.id}`,
        ticketNumber: `CIERRE-${new Date().toISOString().slice(0, 10)}`,
        type: 'closing',
        openTime: new Date(cashSession.openDate).toLocaleTimeString('es-CO'),
        closeTime: closeTime.toLocaleTimeString('es-CO'),
        duration: sessionDuration,
        initialAmount: cashSession.initialAmount,
        fundAmount: cashSession.fundAmount,
        totalSales: totalPayments,
        totalExpenses: totalExpensesByType,
        expensesByPaymentType: expensesByPaymentType,
        paymentBreakdown: paymentBreakdown,
        expectedAmount: cashSession.initialAmount + totalPayments - totalExpensesByType,
        finalCount: parseFloat(finalCount),
        difference: parseFloat(finalCount) - (cashSession.initialAmount + totalPayments - totalExpensesByType),
        observations: observations,
        createdAt: new Date(),
      };

      // Disparar evento con ticket de cierre para impresión
      window.dispatchEvent(new CustomEvent('cashClosed', { 
        detail: { 
          sessionId: closedSession.id,
          closingTicket: closingTicket 
        } 
      }));
    }
    
    onClose();
  };

  const difference = finalCount ? (parseFloat(finalCount) - (cashSession?.initialAmount + totalPayments - totalExpensesByType)) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Lock size={28} className="text-orange-600 dark:text-orange-400" />
            Cierre de Caja
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ✅ PHASE 5: Timestamps */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900 dark:from-opacity-20 dark:to-yellow-900 dark:to-opacity-20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Apertura</p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {new Date(cashSession?.openDate).toLocaleTimeString('es-CO')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Cierre</p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {closeTime.toLocaleTimeString('es-CO')}
                </p>
              </div>
              <div className="flex items-start justify-end text-right">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1 flex items-center gap-1 justify-end">
                    <Clock size={14} /> Duración
                  </p>
                  <p className="font-bold text-orange-600 dark:text-orange-400">
                    {sessionDuration?.hours}h {sessionDuration?.minutes}m
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info de sesión */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Capital Inicial:</span>
              <span className="font-medium text-gray-800 dark:text-white">
                ${cashSession?.initialAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Fondo de Caja:</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                ${cashSession?.fundAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* ✅ PHASE 5: Breakdown automático de pagos */}
          <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                💳 Breakdown de Pagos
              </h3>
              <button
                type="button"
                onClick={() => setShowPaymentBreakdown(!showPaymentBreakdown)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                {showPaymentBreakdown ? '▼' : '▶'}
              </button>
            </div>

            {showPaymentBreakdown && (
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-800">
                  <span className="text-gray-700 dark:text-gray-300">💵 Efectivo</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    ${paymentBreakdown.cash.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-800">
                  <span className="text-gray-700 dark:text-gray-300">💳 Tarjeta</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    ${paymentBreakdown.card.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-800">
                  <span className="text-gray-700 dark:text-gray-300">💸 Transferencia</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    ${paymentBreakdown.transfer.toLocaleString()}
                  </span>
                </div>
                {paymentBreakdown.other > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-800">
                    <span className="text-gray-700 dark:text-gray-300">🔹 Otros</span>
                    <span className="font-bold text-gray-600 dark:text-gray-400">
                      ${paymentBreakdown.other.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3 pt-3 border-t-2 border-blue-300 dark:border-blue-700 font-bold">
                  <span className="text-gray-900 dark:text-white">Total Ventas</span>
                  <span className="text-xl text-blue-600 dark:text-blue-400">
                    ${totalPayments.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>



          {/* Egresos por Tipo de Pago */}
          {totalExpensesByType > 0 && (
            <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900 dark:bg-opacity-20">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">📤 Egresos del Día</h3>
              <div className="space-y-2">
                {expensesByPaymentType.efectivo > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-red-200 dark:border-red-800">
                      <span className="text-gray-700 dark:text-gray-300">💵 Efectivo</span>
                      <span className="font-bold text-red-600 dark:text-red-400">
                        -${expensesByPaymentType.efectivo.toLocaleString()}
                      </span>
                    </div>
                    {/* Desglose de domicilios registrados */}
                    {cashMovements.filter(m => m.type === 'expense' && m.metadata?.category === 'Domicilios').map((movement, idx) => (
                      <div key={idx} className="ml-4 text-xs text-gray-600 dark:text-gray-400 py-1 border-l border-red-200 pl-2">
                        🚗 {movement.description}: -${movement.amount.toLocaleString()}
                      </div>
                    ))}
                    {/* Otros egresos en efectivo */}
                    {cashMovements
                      .filter(m => m.type === 'expense' && m.metadata?.paymentType !== 'bancolombia' && m.metadata?.paymentType !== 'nequi' && m.metadata?.category !== 'Domicilios')
                      .map((movement, idx) => (
                        <div key={idx} className="ml-4 text-xs text-gray-600 dark:text-gray-400 py-1 border-l border-red-200 pl-2">
                          📝 {movement.description}: -${movement.amount.toLocaleString()}
                        </div>
                      ))
                    }
                  </div>
                )}
                {expensesByPaymentType.bancolombia > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-red-200 dark:border-red-800">
                    <span className="text-gray-700 dark:text-gray-300">🏦 Bancolombia</span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      -${expensesByPaymentType.bancolombia.toLocaleString()}
                    </span>
                  </div>
                )}
                {expensesByPaymentType.nequi > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-red-200 dark:border-red-800">
                    <span className="text-gray-700 dark:text-gray-300">📱 Nequi</span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      -${expensesByPaymentType.nequi.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3 pt-3 border-t-2 border-red-300 dark:border-red-700 font-bold">
                  <span className="text-gray-900 dark:text-white">Total Egresos</span>
                  <span className="text-lg text-red-600 dark:text-red-400">
                    -${totalExpensesByType.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ✅ PHASE 5: Cálculo paso a paso */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:from-opacity-20 dark:to-pink-900 dark:to-opacity-20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp size={20} /> Cálculo del Balance
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Capital Inicial:</span>
                <span className="font-medium text-gray-800 dark:text-white">+${cashSession?.initialAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Ventas (automático):</span>
                <span className="font-medium text-green-600 dark:text-green-400">+${totalPayments.toLocaleString()}</span>
              </div>
              {totalExpensesByType > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Egresos:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">-${totalExpensesByType.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-purple-200 dark:border-purple-800 font-bold">
                <span className="text-gray-900 dark:text-white">Monto Esperado:</span>
                <span className="text-purple-600 dark:text-purple-400">
                  ${(cashSession?.initialAmount + totalPayments - totalExpensesByType).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Conteo Final */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📊 Conteo Físico del Día *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={finalCount}
              onChange={(e) => setFinalCount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 text-lg"
              placeholder="0.00"
            />
          </div>

          {/* Diferencia */}
          {finalCount && (
            <div className={`rounded-lg p-4 ${
              difference === 0 
                ? 'bg-green-50 dark:bg-green-900 dark:bg-opacity-20' 
                : difference > 0
                ? 'bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20'
                : 'bg-red-50 dark:bg-red-900 dark:bg-opacity-20'
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">
                  {difference === 0 ? '✅ Cuadre Perfecto' : difference > 0 ? '⚠️ Sobrante' : '❌ Faltante'}
                </span>
                <span className={`text-2xl font-bold ${
                  difference === 0 ? 'text-green-600 dark:text-green-400' :
                  difference > 0 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {difference >= 0 ? '+' : ''}${difference.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observaciones del Cierre
            </label>
            <textarea
              rows="2"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500"
              placeholder="Ej: Todo cuadra correctamente..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
            >
              🔒 Cerrar Caja
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashClosing;
