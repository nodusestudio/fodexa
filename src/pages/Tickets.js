import React, { useState, useMemo } from 'react';
import { useTickets } from '../context/TicketContext';
import { formatCurrency } from '../utils/formatters';
import { Search, Printer, Eye, X, FileText, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import TicketPrint from '../components/tickets/TicketPrint';

const Tickets = () => {
  const { getAllTickets, getTicketsByDate, deleteTicket } = useTickets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [expandedDays, setExpandedDays] = useState({});
  const [expandedCashes, setExpandedCashes] = useState({});

  const tickets = getAllTickets();

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const ticketDate = new Date(ticket.createdAt).toISOString().split('T')[0];
      const matchesDate = ticketDate === selectedDate;
      return matchesSearch && matchesDate;
    });
  }, [tickets, searchQuery, selectedDate]);

  // Agrupar por días y por caja
  const groupedByDay = useMemo(() => {
    const groups = {};
    
    filteredTickets.forEach(ticket => {
      const date = new Date(ticket.createdAt).toLocaleDateString('es-CO');
      
      if (!groups[date]) {
        groups[date] = {
          date,
          ticketsByBox: {}
        };
      }

      // Agrupar por caja (cajero)
      const boxKey = ticket.userId || 'Sin Caja';
      if (!groups[date].ticketsByBox[boxKey]) {
        groups[date].ticketsByBox[boxKey] = [];
      }

      groups[date].ticketsByBox[boxKey].push(ticket);
    });

    return groups;
  }, [filteredTickets]);

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowPrintModal(true);
  };

  const handleDeleteTicket = async (ticket) => {
    const confirmed = window.confirm(
      `⚠️ ¿Eliminar ticket #${ticket.ticketNumber}?\n\n` +
      `Esta acción eliminará:\n` +
      `✂️ El ticket\n` +
      `✂️ La orden asociada\n\n` +
      `Esta acción NO se puede deshacer.`
    );
    
    if (confirmed) {
      try {
        await deleteTicket(ticket.id);
        console.log('✅ Ticket y orden eliminados:', ticket.id);
      } catch (error) {
        console.error('❌ Error:', error);
        alert('Error al eliminar: ' + error.message);
      }
    }
  };

  const toggleDayExpanded = (date) => {
    setExpandedDays(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const toggleBoxExpanded = (key) => {
    setExpandedCashes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const totalVentas = filteredTickets.reduce((sum, t) => sum + t.total, 0);
  const totalEfectivo = filteredTickets.filter(t => t.paymentType === 'cash').reduce((sum, t) => sum + t.total, 0);
  const totalTarjeta = filteredTickets.filter(t => t.paymentType === 'card').reduce((sum, t) => sum + t.total, 0);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-1 sm:gap-2">
          <FileText size={24} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span>Tickets de Venta</span>
        </h1>
      </div>

      {/* Filtros y Resumen */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar ticket #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Resumen del día - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">Tickets</p>
            <p className="text-lg sm:text-2xl font-bold text-blue-800 dark:text-blue-300">{filteredTickets.length}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">Ventas</p>
            <p className="text-lg sm:text-2xl font-bold text-green-800 dark:text-green-300 truncate">{formatCurrency(totalVentas)}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400">Efectivo</p>
            <p className="text-lg sm:text-2xl font-bold text-yellow-800 dark:text-yellow-300 truncate">{formatCurrency(totalEfectivo)}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400">Tarjeta</p>
            <p className="text-lg sm:text-2xl font-bold text-purple-800 dark:text-purple-300 truncate">{formatCurrency(totalTarjeta)}</p>
          </div>
        </div>
      </div>

      {/* Tickets agrupados por día y caja */}
      <div className="flex-1 overflow-auto p-2 sm:p-4 md:p-6">
        {Object.entries(groupedByDay).length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
            <FileText size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No hay tickets para esta fecha</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedByDay).map(([dayKey, dayData]) => (
              <div key={dayKey} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header del Día */}
                <button
                  onClick={() => toggleDayExpanded(dayKey)}
                  className="w-full px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    📅 {dayKey}
                  </span>
                  {expandedDays[dayKey] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {/* Contenido del Día */}
                {expandedDays[dayKey] && (
                  <div className="space-y-2 p-3 sm:p-4">
                    {Object.entries(dayData.ticketsByBox).map(([boxKey, boxTickets]) => (
                      <div key={boxKey} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                        {/* Header de la Caja */}
                        <button
                          onClick={() => toggleBoxExpanded(boxKey)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-left font-semibold text-gray-800 dark:text-white flex items-center justify-between transition-all"
                        >
                          <span className="flex items-center gap-2 text-sm sm:text-base">
                            💰 Caja: {boxKey}
                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                              {boxTickets.length} tickets
                            </span>
                          </span>
                          {expandedCashes[boxKey] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>

                        {/* Tabla de Tickets */}
                        {expandedCashes[boxKey] && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs sm:text-sm">
                              <thead className="bg-gray-50 dark:bg-gray-600 border-t border-b border-gray-200 dark:border-gray-500">
                                <tr>
                                  <th className="px-2 sm:px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">#</th>
                                  <th className="px-2 sm:px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300 hidden sm:table-cell">Tipo</th>
                                  <th className="px-2 sm:px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300 hidden md:table-cell">Cliente</th>
                                  <th className="px-2 sm:px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Pago</th>
                                  <th className="px-2 sm:px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-300">Total</th>
                                  <th className="px-2 sm:px-4 py-2 text-center font-medium text-gray-600 dark:text-gray-300">Acciones</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                {boxTickets.map(ticket => (
                                  <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <td className="px-2 sm:px-4 py-2 font-mono font-bold text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                                      #{ticket.ticketNumber}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 hidden sm:table-cell">
                                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        ticket.orderType === 'table' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                                        ticket.orderType === 'delivery' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                                        'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                      }`}>
                                        {ticket.orderType === 'table' ? '🎫' : ticket.orderType === 'delivery' ? '🏍' : '🛍'}
                                      </span>
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 text-gray-600 dark:text-gray-300 hidden md:table-cell text-xs sm:text-sm">
                                      {ticket.customer?.name || '-'}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2">
                                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        ticket.paymentType === 'cash' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                                        ticket.paymentType === 'card' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                                        'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                      }`}>
                                        {ticket.paymentType === 'cash' ? '💵' : ticket.paymentType === 'card' ? '💳' : '💸'}
                                      </span>
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 text-right font-bold text-gray-800 dark:text-white text-xs sm:text-sm">
                                      {formatCurrency(ticket.total)}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 text-center flex items-center justify-center gap-2">
                                      <button
                                        onClick={() => handleViewTicket(ticket)}
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center"
                                        title="Ver/Imprimir"
                                      >
                                        <Printer size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteTicket(ticket)}
                                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 inline-flex items-center"
                                        title="Eliminar ticket y orden"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Impresión */}
      {showPrintModal && selectedTicket && (
        <TicketPrint
          ticket={selectedTicket}
          onClose={() => { setShowPrintModal(false); setSelectedTicket(null); }}
        />
      )}
    </div>
  );
};

export default Tickets;
