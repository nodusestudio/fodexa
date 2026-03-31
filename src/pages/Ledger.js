import React, { useState, useMemo } from 'react';
import { useCash } from '../context/CashContext';
import { FileText, Calendar, TrendingUp, DollarSign, Filter, ChevronDown } from 'lucide-react';

const Ledger = () => {
  const { getSessionsByDateRange, getPeriodSummary, sessionHistory } = useCash();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [expandedView, setExpandedView] = useState('week'); // 'week' or 'month'
  const [showPaymentBreakdown, setShowPaymentBreakdown] = useState(true);

  // Generar todas las sesiones con datos de ejemplo si no hay datos reales
  const allSessions = useMemo(() => {
    if (!sessionHistory || sessionHistory.length === 0) {
      // Datos de ejemplo para 7 últimos días
      const mockSessions = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(Math.floor(Math.random() * 7) + 8, 0, 0, 0);
        
        const closeDate = new Date(date);
        closeDate.setHours(closeDate.getHours() + (Math.floor(Math.random() * 10) + 8));

        const sales = Math.floor(Math.random() * 2000) + 500;
        const expenses = Math.floor(sales * 0.15);
        
        mockSessions.push({
          id: `mock_${i}`,
          openDate: date,
          closeDate: closeDate,
          initialAmount: 500000,
          sales: sales,
          expenses: expenses,
          difference: Math.floor(Math.random() * 10000) - 5000,
          paymentBreakdown: {
            cash: Math.floor(sales * 0.5),
            card: Math.floor(sales * 0.4),
            transfer: Math.floor(sales * 0.1),
          },
          status: 'closed',
        });
      }
      return mockSessions;
    }
    return sessionHistory;
  }, [sessionHistory]);

  // Calcular rango de fechas para vista semanal (últimos 7 días)
  const weekDateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    return { start, end };
  }, []);

  // Calcular rango de fechas para mes seleccionado
  const monthDateRange = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    const start = new Date(year, parseInt(month) - 1, 1);
    const end = new Date(year, parseInt(month), 0, 23, 59, 59);
    return { start, end };
  }, [selectedMonth]);

  // Filtrar sesiones según la vista
  const filteredSessions = useMemo(() => {
    const dateRange = expandedView === 'week' ? weekDateRange : monthDateRange;
    return allSessions.filter(session => {
      const closeDate = new Date(session.closeDate);
      return closeDate >= dateRange.start && closeDate <= dateRange.end;
    });
  }, [allSessions, expandedView, weekDateRange, monthDateRange]);

  // Calcular resumen
  const summary = useMemo(() => {
    const totalSales = filteredSessions.reduce((sum, s) => sum + (s.sales || 0), 0);
    const totalExpenses = filteredSessions.reduce((sum, s) => sum + (s.expenses || 0), 0);
    const totalDifference = filteredSessions.reduce((sum, s) => sum + (s.difference || 0), 0);
    const balance = totalSales - totalExpenses;

    // Breakdown por método de pago
    const paymentBreakdown = {
      cash: 0,
      card: 0,
      transfer: 0,
    };

    filteredSessions.forEach(session => {
      if (session.paymentBreakdown) {
        paymentBreakdown.cash += session.paymentBreakdown.cash || 0;
        paymentBreakdown.card += session.paymentBreakdown.card || 0;
        paymentBreakdown.transfer += session.paymentBreakdown.transfer || 0;
      }
    });

    return {
      totalSales,
      totalExpenses,
      totalDifference,
      balance,
      paymentBreakdown,
      sessionCount: filteredSessions.length,
    };
  }, [filteredSessions]);

  // Generar meses disponibles
  const availableMonths = useMemo(() => {
    const months = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      months.push({
        value: `${year}-${month}`,
        label: new Date(year, date.getMonth()).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }),
      });
    }
    return months;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FileText size={36} className="text-blue-600 dark:text-blue-400" />
              Libro Contable
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Resumen de ingresos, egresos y estado de caja
            </p>
          </div>
        </div>

        {/* Vista Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setExpandedView('week')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              expandedView === 'week'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            📅 Última Semana
          </button>
          <button
            onClick={() => setExpandedView('month')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              expandedView === 'month'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            📆 Mes Completo
          </button>
        </div>

        {/* Mes Selector - Solo visible en vista mensual */}
        {expandedView === 'month' && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={18} className="text-gray-600 dark:text-gray-400" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Seleccionar Mes</label>
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
            >
              {availableMonths.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Saldo Prominente */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-900 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-2">💰 Saldo Total</p>
              <h2 className="text-5xl font-bold">${summary.balance.toLocaleString('es-CO')}</h2>
              <p className="text-blue-100 text-sm mt-3">
                {expandedView === 'week' ? 'Últimos 7 días' : `${new Date(selectedMonth + '-01').toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}`}
              </p>
            </div>
            <div className="bg-blue-500 bg-opacity-30 p-4 rounded-xl">
              <DollarSign size={40} />
            </div>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Ventas */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">📈 Ventas Totales</p>
              <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-3xl font-bold text-green-600 dark:text-green-400">
              ${summary.totalSales.toLocaleString('es-CO')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {summary.sessionCount} {summary.sessionCount === 1 ? 'sesión' : 'sesiones'}
            </p>
          </div>

          {/* Egresos */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">📤 Egresos Totales</p>
              <Filter size={20} className="text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              -${summary.totalExpenses.toLocaleString('es-CO')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {(summary.totalExpenses / summary.totalSales * 100).toFixed(1)}% de ventas
            </p>
          </div>

          {/* Diferencia */}
          <div className={`rounded-xl p-6 shadow-sm border ${
            summary.totalDifference >= 0
              ? 'bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm font-medium ${
                summary.totalDifference >= 0
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {summary.totalDifference >= 0 ? '✅ Diferencia' : '⚠️ Faltante'}
              </p>
            </div>
            <h3 className={`text-3xl font-bold ${
              summary.totalDifference >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {summary.totalDifference >= 0 ? '+' : ''}${summary.totalDifference.toLocaleString('es-CO')}
            </h3>
          </div>
        </div>

        {/* Breakdown por Método de Pago */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">💳 Breakdown por Método de Pago</h3>
            <button
              onClick={() => setShowPaymentBreakdown(!showPaymentBreakdown)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronDown size={20} className={`transform transition-transform ${showPaymentBreakdown ? '' : '-rotate-90'}`} />
            </button>
          </div>

          {showPaymentBreakdown && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Efectivo */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:from-opacity-20 dark:to-green-900 dark:to-opacity-10 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">💵 Efectivo</p>
                <h4 className="text-2xl font-bold text-green-700 dark:text-green-400">
                  ${summary.paymentBreakdown.cash.toLocaleString('es-CO')}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {summary.totalSales > 0 ? ((summary.paymentBreakdown.cash / summary.totalSales * 100).toFixed(1)) : 0}% de ventas
                </p>
              </div>

              {/* Tarjeta */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:from-opacity-20 dark:to-blue-900 dark:to-opacity-10 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">💳 Tarjeta</p>
                <h4 className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  ${summary.paymentBreakdown.card.toLocaleString('es-CO')}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {summary.totalSales > 0 ? ((summary.paymentBreakdown.card / summary.totalSales * 100).toFixed(1)) : 0}% de ventas
                </p>
              </div>

              {/* Transferencia */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:from-opacity-20 dark:to-purple-900 dark:to-opacity-10 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">💸 Transferencia</p>
                <h4 className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                  ${summary.paymentBreakdown.transfer.toLocaleString('es-CO')}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {summary.totalSales > 0 ? ((summary.paymentBreakdown.transfer / summary.totalSales * 100).toFixed(1)) : 0}% de ventas
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Detalle de Sesiones */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">📋 Detalle de Sesiones</h3>
          </div>

          {filteredSessions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Fecha</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Ventas</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Egresos</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Diferencia</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSessions.map(session => (
                    <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {new Date(session.closeDate).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-green-600 dark:text-green-400">
                        ${session.sales?.toLocaleString('es-CO') || '0'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-orange-600 dark:text-orange-400">
                        -${session.expenses?.toLocaleString('es-CO') || '0'}
                      </td>
                      <td className={`px-6 py-4 text-right text-sm font-medium ${
                        (session.difference || 0) >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {(session.difference || 0) >= 0 ? '+' : ''}${(session.difference || 0).toLocaleString('es-CO')}
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 dark:bg-opacity-30 text-green-800 dark:text-green-300">
                          ✅ Cerrada
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No hay sesiones registradas para este período
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ledger;
