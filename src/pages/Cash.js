import React, { useState, useEffect, useMemo } from 'react';
import { useCash } from '../context/CashContext';
import { useTickets } from '../context/TicketContext';
import { DollarSign, MinusCircle, Lock, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import CashOpening from '../components/cash/CashOpening';
import CashExpenses from '../components/cash/CashExpenses';
import CashClosing from '../components/cash/CashClosing';
import CashClosingTicket from '../components/cash/CashClosingTicket';
import CashFundControl from '../components/cash/CashFundControl';
import CashHistory from './CashHistory';

const Cash = () => {
  const { isCashOpen, cashSession, getCashSummary, getTodayExpenses, cashMovements, closeCash, calculateDeliveryExpenses, registerDeliveryExpenses, setCashSession } = useCash();
  const { tickets } = useTickets();
  const [showOpening, setShowOpening] = useState(false);
  const [showExpenses, setShowExpenses] = useState(false);
  const [showClosing, setShowClosing] = useState(false);
  const [showFundControl, setShowFundControl] = useState(false);
  const [selectedTab, setSelectedTab] = useState('actual');
  const [showClosingTicket, setShowClosingTicket] = useState(false);
  const [lastClosedSessionId, setLastClosedSessionId] = useState(null);
  const [localFundAmount, setLocalFundAmount] = useState(cashSession?.fundAmount || 0);

  const summary = getCashSummary();
  const todayExpenses = getTodayExpenses();
  
  // ✅ Sincronizar fondo de caja local con la sesión
  useEffect(() => {
    if (cashSession?.fundAmount) {
      setLocalFundAmount(cashSession.fundAmount);
    }
  }, [cashSession?.fundAmount]);
  
  // ✅ Calcular automáticos de domicilios
  const deliveryExpenses = useMemo(() => {
    return calculateDeliveryExpenses(tickets);
  }, [tickets, calculateDeliveryExpenses]);

  // ✅ Registrar automáticamente los egresos de domicilios completados
  useEffect(() => {
    if (isCashOpen && tickets && tickets.length > 0) {
      registerDeliveryExpenses(tickets);
    }
  }, [tickets, isCashOpen, registerDeliveryExpenses]);

  // Escuchar evento de cierre de caja
  useEffect(() => {
    const handleCashClosed = (event) => {
      if (event.detail?.sessionId) {
        setLastClosedSessionId(event.detail.sessionId);
        setShowClosingTicket(true);
        console.log('✅ Caja cerrada - Mostrando ticket:', event.detail.sessionId);
      }
    };

    window.addEventListener('cashClosed', handleCashClosed);
    return () => window.removeEventListener('cashClosed', handleCashClosed);
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h1 className="text-base sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2 sm:gap-3">
            <DollarSign size={20} className="sm:w-6 sm:h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
            <span>Caja</span>
          </h1>
        </div>
        
        {/* Pestañas */}
        <div className="flex gap-1 sm:gap-2 border-b border-gray-300 dark:border-gray-700 overflow-x-auto">
          <button
            onClick={() => setSelectedTab('actual')}
            className={`px-2.5 sm:px-4 py-2 sm:py-2.5 font-semibold transition-colors border-b-2 text-xs sm:text-sm whitespace-nowrap ${
              selectedTab === 'actual'
                ? 'border-green-600 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Actual
          </button>
          <button
            onClick={() => setSelectedTab('historial')}
            className={`px-3 sm:px-4 py-2 font-semibold transition-colors border-b-2 text-xs sm:text-sm whitespace-nowrap ${
              selectedTab === 'historial'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Historial
          </button>
        </div>
      </div>

      {/* Contenido según pestaña */}
      {selectedTab === 'actual' ? (
        <div className="flex-1 overflow-auto flex flex-col">
          {/* Estado de Caja */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-2 sm:py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${isCashOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-sm sm:text-lg font-semibold text-gray-800 dark:text-white">
                  {isCashOpen ? '✅ Caja Abierta' : '❌ Caja Cerrada'}
                </span>
              </div>
              {isCashOpen && (
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                  Apertura: {new Date(cashSession?.openDate).toLocaleString('es-CO')}
                </span>
              )}
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
            {!isCashOpen ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center px-4">
                  <DollarSign size={60} className="sm:w-20 sm:h-20 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Caja Cerrada
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                    Debes abrir caja para comenzar a operar
                  </p>
                  <button
                    onClick={() => setShowOpening(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-lg flex items-center gap-2 sm:gap-3 mx-auto transition-colors"
                  >
                    <DollarSign size={20} className="sm:w-6 sm:h-6" />
                    Abrir Caja
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {/* Tarjetas de Resumen - Compacto */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                  {/* Fondo de Caja */}
                  <button
                    onClick={() => setShowFundControl(true)}
                    className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:from-opacity-30 dark:to-green-800 dark:to-opacity-20 hover:shadow-lg hover:scale-105 transition-all rounded-lg p-2 sm:p-3 border border-green-200 dark:border-green-700 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                      <DollarSign className="text-green-600 dark:text-green-400 flex-shrink-0" size={16} className="sm:w-5 sm:h-5" />
                      <span className="text-xs font-semibold text-green-700 dark:text-green-400 whitespace-nowrap">Fondo</span>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-green-800 dark:text-green-300 truncate">
                      {formatCurrency(localFundAmount || 0)}
                    </p>
                  </button>
                  
                  {/* Ventas */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:from-opacity-30 dark:to-blue-800 dark:to-opacity-20 rounded-lg p-2 sm:p-3 border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                      <TrendingUp className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={16} className="sm:w-5 sm:h-5" />
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 whitespace-nowrap">Ventas</span>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-blue-800 dark:text-blue-300 truncate">
                      {formatCurrency(summary?.sales || 0)}
                    </p>
                  </div>
                  
                  {/* Egresos */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:from-opacity-30 dark:to-red-800 dark:to-opacity-20 rounded-lg p-2 sm:p-3 border border-red-200 dark:border-red-700">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                      <MinusCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={16} className="sm:w-5 sm:h-5" />
                      <span className="text-xs font-semibold text-red-700 dark:text-red-400 whitespace-nowrap">Egresos</span>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-red-800 dark:text-red-300 truncate">
                      {formatCurrency((summary?.expenses || 0) + deliveryExpenses)}
                    </p>
                    {deliveryExpenses > 0 && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                        🚗 {formatCurrency(deliveryExpenses)}
                      </p>
                    )}
                  </div>
                  
                  {/* Esperado */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:from-opacity-30 dark:to-purple-800 dark:to-opacity-20 rounded-lg p-2 sm:p-3 border border-purple-200 dark:border-purple-700">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                      <Lock className="text-purple-600 dark:text-purple-400 flex-shrink-0" size={16} className="sm:w-5 sm:h-5" />
                      <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 whitespace-nowrap">Esperado</span>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-purple-800 dark:text-purple-300 truncate">
                      {formatCurrency(summary?.expected || 0)}
                    </p>
                  </div>
                </div>

                {/* Acciones - Compacto */}
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowExpenses(true)}
                    className="bg-red-500 hover:bg-red-600 text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-colors text-xs sm:text-sm"
                  >
                    <MinusCircle size={18} className="sm:w-5 sm:h-5" />
                    Egreso
                  </button>
                  
                  <button
                    onClick={() => setShowClosing(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-colors text-xs sm:text-sm"
                  >
                    <Lock size={18} className="sm:w-5 sm:h-5" />
                    Cerrar
                  </button>
                </div>

                {/* Movimientos del Día - Compacto */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="px-3 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white whitespace-nowrap">
                      📋 Movimientos del Día
                    </h3>
                  </div>
                  <div className="overflow-x-auto max-h-64 sm:max-h-80">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                        <tr>
                          <th className="px-2 sm:px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Hora</th>
                          <th className="px-2 sm:px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 hidden sm:table-cell">Tipo</th>
                          <th className="px-2 sm:px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Desc</th>
                          <th className="px-2 sm:px-3 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {cashMovements
                          .filter(m => new Date(m.date).toDateString() === new Date().toDateString())
                          .slice(-15)
                          .reverse()
                          .map(movement => (
                            <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400">
                                {new Date(movement.date).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap hidden sm:table-cell">
                                <span className={`px-1.5 py-0.5 text-xs font-semibold rounded ${
                                  movement.type === 'opening' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                                  movement.type === 'sale' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                                  movement.type === 'expense' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                                  'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                }`}>
                                  {movement.type === 'opening' ? 'Aper' :
                                   movement.type === 'sale' ? 'Venta' :
                                   movement.type === 'expense' ? 'Egreso' : movement.type}
                                </span>
                              </td>
                              <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs text-gray-600 dark:text-gray-400 truncate max-w-xs">
                                {movement.description}
                              </td>
                              <td className={`px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap text-right text-xs font-semibold ${
                                movement.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                              }`}>
                                {movement.type === 'expense' ? '-' : '+'}{formatCurrency(movement.amount)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <CashHistory />
      )}

      {/* Modales */}
      {showOpening && <CashOpening onClose={() => setShowOpening(false)} />}
      {showExpenses && <CashExpenses onClose={() => setShowExpenses(false)} />}
      {showClosing && <CashClosing onClose={() => setShowClosing(false)} />}
      {showFundControl && (
        <CashFundControl
          fundAmount={localFundAmount}
          onClose={() => setShowFundControl(false)}
          onUpdate={(newAmount) => {
            setLocalFundAmount(newAmount);
            // Actualizar la sesión de caja con el nuevo fondo
            if (cashSession) {
              setCashSession({
                ...cashSession,
                fundAmount: newAmount
              });
            }
          }}
        />
      )}
      {showClosingTicket && (
        <CashClosingTicket
          isOpen={showClosingTicket}
          onClose={() => setShowClosingTicket(false)}
          sessionId={lastClosedSessionId}
        />
      )}
    </div>
  );
};

export default Cash;
