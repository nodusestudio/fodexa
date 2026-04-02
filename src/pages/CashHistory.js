import React, { useState, useMemo, useEffect } from 'react';
import { formatCurrency } from '../utils/formatters';
import { useCash } from '../context/CashContext';
import { Calendar, Search, Eye, Download } from 'lucide-react';
import CashClosingTicket from '../components/cash/CashClosingTicket';

function CashHistory() {
  const { sessionHistory, getSessionsByDateRange } = useCash();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Últimos 30 días
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [sortBy, setSortBy] = useState('date-desc');

  // Debug: mostrar sesiones cargadas
  useEffect(() => {
    console.log('📋 CashHistory - Sesiones cargadas del contexto:', sessionHistory.length);
    if (sessionHistory.length > 0) {
      console.log('   Primeras sesiones:', sessionHistory.slice(0, 2));
    }
  }, [sessionHistory]);

  // Filtrar sesiones por fecha y búsqueda
  const filteredSessions = useMemo(() => {
    if (!sessionHistory || sessionHistory.length === 0) {
      console.warn('⚠️  No hay sesiones en el historial');
      return [];
    }

    let filtered = sessionHistory.filter(session => {
      if (!session.closeDate) {
        console.warn('⚠️  Sesión sin closeDate:', session.id);
        return false; // Solo sesiones cerradas
      }
      
      // Parsear fecha de cierre (ISO string)
      const sessionDate = new Date(session.closeDate);
      
      // Convertir inputs de fecha (que son YYYY-MM-DD) a fechas locales
      const startParts = startDate.split('-');
      const start = new Date(startParts[0], startParts[1] - 1, startParts[2], 0, 0, 0);
      
      const endParts = endDate.split('-');
      const end = new Date(endParts[0], endParts[1] - 1, endParts[2], 23, 59, 59, 999);

      // Comparar considerando zonas horarias
      const dateMatch = sessionDate >= start && sessionDate <= end;
      const searchMatch = searchTerm === '' || 
        session.id.toString().includes(searchTerm) ||
        session.openUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (session.closeUser?.toLowerCase().includes(searchTerm.toLowerCase()));

      // Debug
      if (!dateMatch && sessionHistory.length <= 3) {
        console.log('❌ Sesión rechazada por fecha:');
        console.log('   Hora sesión:', sessionDate.toLocaleString('es-CO'));
        console.log('   Rango local:', start.toLocaleString('es-CO'), 'a', end.toLocaleString('es-CO'));
      }

      return dateMatch && searchMatch;
    });

    console.log('🔍 Sesiones filtradas:', filtered.length, 'de', sessionHistory.length);
    if (filtered.length > 0) {
      console.log('   ✅ Sesiones encontradas');
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.closeDate) - new Date(b.closeDate);
        case 'date-desc':
          return new Date(b.closeDate) - new Date(a.closeDate);
        case 'sales-high':
          return (b.sales || 0) - (a.sales || 0);
        case 'sales-low':
          return (a.sales || 0) - (b.sales || 0);
        case 'difference':
          return Math.abs(b.difference || 0) - Math.abs(a.difference || 0);
        default:
          return new Date(b.closeDate) - new Date(a.closeDate);
      }
    });

    return filtered;
  }, [sessionHistory, startDate, endDate, searchTerm, sortBy]);

  // Calcular resumen
  const summary = useMemo(() => {
    return {
      totalSessions: filteredSessions.length,
      totalSales: filteredSessions.reduce((sum, s) => sum + (s.sales || 0), 0),
      totalExpenses: filteredSessions.reduce((sum, s) => sum + (s.expenses || 0), 0),
      totalDifference: filteredSessions.reduce((sum, s) => sum + (s.difference || 0), 0),
      totalDifferenceAbs: filteredSessions.reduce((sum, s) => sum + Math.abs(s.difference || 0), 0),
    };
  }, [filteredSessions]);



  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDifferenceClass = (difference) => {
    if (difference < 0) return 'text-red-600 font-bold';
    if (difference > 0) return 'text-green-600 font-bold';
    return 'text-blue-600 font-bold';
  };

  const handleExportCSV = () => {
    if (filteredSessions.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const headers = ['Sesión', 'Fecha Cierre', 'Usuario', 'Inicial', 'Ventas', 'Egresos', 'Esperado', 'Contado', 'Diferencia'];
    const rows = filteredSessions.map(s => [
      s.id?.toString().slice(-6) || 'N/A',
      new Date(s.closeDate).toLocaleString('es-CO'),
      s.closeUser || s.openUser,
      s.initialAmount,
      s.sales || 0,
      s.expenses || 0,
      s.expectedAmount,
      s.finalCount,
      s.difference || 0,
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historial_caja_${new Date().getTime()}.csv`;
    link.click();
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-2 sm:py-4">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white">Historial de Cajas</h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">Visualiza y gestiona todas las cajas cerradas</p>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-2 sm:py-4 space-y-2 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          {/* Fecha Inicio */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              <Calendar size={14} className="inline mr-1" />
              Desde
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              <Calendar size={14} className="inline mr-1" />
              Hasta
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
            />
          </div>

          {/* Búsqueda */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              <Search size={14} className="inline mr-1" />
              Buscar
            </label>
            <input
              type="text"
              placeholder="Sesión, usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
            />
          </div>

          {/* Ordenar */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Ordenar</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
            >
              <option value="date-desc">Más reciente</option>
              <option value="date-asc">Más antiguo</option>
              <option value="sales-high">Mayor venta</option>
              <option value="sales-low">Menor venta</option>
              <option value="difference">Mayor diferencia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-2 sm:py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 sm:p-4">
            <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-semibold">Sesiones</p>
            <p className="text-lg sm:text-2xl font-bold text-purple-800 dark:text-purple-300">{summary.totalSessions}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 sm:p-4">
            <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-semibold">Total Ventas</p>
            <p className="text-lg sm:text-2xl font-bold text-blue-800 dark:text-blue-300">{formatCurrency(summary.totalSales)}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 sm:p-4">
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-semibold">Total Egresos</p>
            <p className="text-lg sm:text-2xl font-bold text-red-800 dark:text-red-300">{formatCurrency(summary.totalExpenses)}</p>
          </div>
          <div className={`rounded-lg p-2 sm:p-4 ${summary.totalDifference < 0 ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
            <p className={`text-xs sm:text-sm font-semibold ${summary.totalDifference < 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
              Diferencia Neta
            </p>
            <p className={`text-lg sm:text-2xl font-bold ${summary.totalDifference < 0 ? 'text-orange-800 dark:text-orange-300' : 'text-green-800 dark:text-green-300'}`}>
              {formatCurrency(summary.totalDifference)}
            </p>
          </div>
          <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-2 sm:p-4">
            <p className="text-xs sm:text-sm text-teal-600 dark:text-teal-400 font-semibold">Dif. Absoluta</p>
            <p className="text-lg sm:text-2xl font-bold text-teal-800 dark:text-teal-300">{formatCurrency(summary.totalDifferenceAbs)}</p>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="flex-1 overflow-auto px-3 sm:px-6 py-2 sm:py-4">
        {filteredSessions.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-6xl mb-4">📭</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white mb-2">Sin resultados</p>
              <p className="text-gray-600 dark:text-gray-400">No hay cajas cerradas en este período</p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Sesión</th>
                    <th className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Fecha</th>
                    <th className="hidden md:table-cell px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Usuario</th>
                    <th className="hidden lg:table-cell px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Inicial</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Ventas</th>
                    <th className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Egresos</th>
                    <th className="hidden md:table-cell px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Esperado</th>
                    <th className="hidden lg:table-cell px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Contado</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Diferencia</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Ver</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-2 sm:px-4 py-2 sm:py-3 font-bold text-gray-800 dark:text-white">
                        #{session.id?.toString().slice(-6) || 'N/A'}
                      </td>
                      <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-gray-600 dark:text-gray-400">
                        {formatDate(session.closeDate)}
                      </td>
                      <td className="hidden md:table-cell px-2 sm:px-4 py-2 sm:py-3 text-gray-600 dark:text-gray-400">
                        {session.closeUser || session.openUser}
                      </td>
                      <td className="hidden lg:table-cell px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-800 dark:text-white">
                        {formatCurrency(session.initialAmount)}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-blue-600 dark:text-blue-400">
                        {formatCurrency(session.sales || 0)}
                      </td>
                      <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(session.expenses || 0)}
                      </td>
                      <td className="hidden md:table-cell px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-800 dark:text-white">
                        {formatCurrency(session.expectedAmount)}
                      </td>
                      <td className="hidden lg:table-cell px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-800 dark:text-white">
                        {formatCurrency(session.finalCount)}
                      </td>
                      <td className={`px-2 sm:px-4 py-2 sm:py-3 text-right ${getDifferenceClass(session.difference)}`}>
                        {formatCurrency(Math.abs(session.difference || 0))}
                        <br />
                        <span className="text-xs">
                          {session.difference < 0 ? 'Falta' : session.difference > 0 ? 'Sobra' : 'Exacto'}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedSessionId(session.id);
                            setShowTicketModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-xs font-semibold"
                        >
                          <Eye size={14} />
                          <span className="hidden sm:inline">Ver</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer con Exportar */}
      {filteredSessions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-2 sm:py-4 flex justify-end">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-medium sm:font-semibold rounded-lg transition-colors text-xs sm:text-sm"
          >
            <Download size={18} />
            Exportar a CSV
          </button>
        </div>
      )}

      {/* Modal de Ticket */}
      <CashClosingTicket
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        sessionId={selectedSessionId}
      />
    </div>
  );
}

export default CashHistory;
