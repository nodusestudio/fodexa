import React, { useState, useEffect } from 'react';
import { useCash } from '../context/CashContext';
import { DollarSign, MinusCircle, Lock, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import CashOpening from '../components/cash/CashOpening';
import CashExpenses from '../components/cash/CashExpenses';
import CashClosing from '../components/cash/CashClosing';
import CashClosingTicket from '../components/cash/CashClosingTicket';
import CashHistory from './CashHistory';

const Cash = () => {
  const { isCashOpen, cashSession, getCashSummary, getTodayExpenses, cashMovements, closeCash } = useCash();
  const [showOpening, setShowOpening] = useState(false);
  const [showExpenses, setShowExpenses] = useState(false);
  const [showClosing, setShowClosing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('actual');
  const [showClosingTicket, setShowClosingTicket] = useState(false);
  const [lastClosedSessionId, setLastClosedSessionId] = useState(null);

  const summary = getCashSummary();
  const todayExpenses = getTodayExpenses();

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
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-1 sm:gap-2">
            <DollarSign size={24} className="text-green-600 dark:text-green-400 flex-shrink-0" />
            <span>Caja</span>
          </h1>
        </div>
        
        {/* Pestañas */}
        <div className="flex gap-1 sm:gap-2 border-b border-gray-300 dark:border-gray-700 overflow-x-auto">
          <button
            onClick={() => setSelectedTab('actual')}
            className={`px-3 sm:px-4 py-2 font-semibold transition-colors border-b-2 text-xs sm:text-sm whitespace-nowrap ${
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
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${isCashOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-lg font-semibold text-gray-800 dark:text-white">
                  {isCashOpen ? '✅ Caja Abierta' : '❌ Caja Cerrada'}
                </span>
              </div>
              {isCashOpen && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Apertura: {new Date(cashSession?.openDate).toLocaleString('es-CO')}
                </span>
              )}
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 overflow-auto p-6">
            {!isCashOpen ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <DollarSign size={80} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Caja Cerrada
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Debes abrir caja para comenzar a operar
                  </p>
                  <button
                    onClick={() => setShowOpening(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-3 mx-auto transition-colors"
                  >
                    <DollarSign size={24} />
                    Abrir Caja
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Tarjetas de Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="text-green-600 dark:text-green-400" size={24} />
                      <span className="text-sm text-green-600 dark:text-green-400">Inicial</span>
                    </div>
                    <p className="text-3xl font-bold text-green-800 dark:text-green-300">
                      ${summary?.initialAmount.toLocaleString()}
                        {formatCurrency(summary?.initialAmount || 0)}
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
                      <span className="text-sm text-blue-600 dark:text-blue-400">Ventas</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-800 dark:text-blue-300">
                      ${summary?.sales.toLocaleString()}
                        {formatCurrency(summary?.sales || 0)}
                    </p>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <MinusCircle className="text-red-600 dark:text-red-400" size={24} />
                      <span className="text-sm text-red-600 dark:text-red-400">Egresos</span>
                    </div>
                    <p className="text-3xl font-bold text-red-800 dark:text-red-300">
                      ${summary?.expenses.toLocaleString()}
                        {formatCurrency(summary?.expenses || 0)}
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Lock className="text-purple-600 dark:text-purple-400" size={24} />
                      <span className="text-sm text-purple-600 dark:text-purple-400">Esperado</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-800 dark:text-purple-300">
                      ${summary?.expected.toLocaleString()}
                        {formatCurrency(summary?.expected || 0)}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={() => setShowExpenses(true)}
                    className="bg-red-500 hover:bg-red-600 text-white p-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-colors"
                  >
                    <MinusCircle size={28} />
                    Registrar Egreso
                  </button>
                  
                  <button
                    onClick={() => setShowClosing(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white p-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-colors"
                  >
                    <Lock size={28} />
                    Cerrar Caja
                  </button>
                </div>

                {/* Movimientos del Día */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      📋 Movimientos del Día
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hora</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tipo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Descripción</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {cashMovements
                          .filter(m => new Date(m.date).toDateString() === new Date().toDateString())
                          .slice(-10)
                          .reverse()
                          .map(movement => (
                            <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                {new Date(movement.date).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  movement.type === 'opening' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                                  movement.type === 'sale' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                                  movement.type === 'expense' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                                  'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                }`}>
                                  {movement.type === 'opening' ? 'Apertura' :
                                   movement.type === 'sale' ? 'Venta' :
                                   movement.type === 'expense' ? 'Egreso' : movement.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                {movement.description}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${
                                movement.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                              }`}>
                                {movement.type === 'expense' ? '-' : '+'}${movement.amount.toLocaleString()}
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
