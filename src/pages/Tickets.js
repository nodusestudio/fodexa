import React, { useState } from 'react';
import { useTickets } from '../context/TicketContext';
import { formatCurrency } from '../utils/formatters';
import { Search, Printer, Eye, X, FileText, Trash2 } from 'lucide-react';
import TicketPrint from '../components/tickets/TicketPrint';

const Tickets = () => {
  const { getAllTickets, getTicketsByDate, deleteTicket } = useTickets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const tickets = getAllTickets();

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const ticketDate = new Date(ticket.createdAt).toISOString().split('T')[0];
    const matchesDate = ticketDate === selectedDate;
    return matchesSearch && matchesDate;
  });

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowPrintModal(true);
  };

  const handleDeleteTicket = async (ticket) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar el ticket ${ticket.ticketNumber}?\n\nEsta acción eliminará el pedido de todo el sistema y no se puede deshacer.`
    );
    
    if (confirmed) {
      try {
        await deleteTicket(ticket.id);
        console.log('✅ Ticket eliminado:', ticket.id);
      } catch (error) {
        console.error('❌ Error eliminando ticket:', error);
        alert('Error al eliminar el ticket: ' + error.message);
      }
    }
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
          <span>Tickets</span>
        </h1>
      </div>

      {/* Filtros y Resumen */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar ticket..."
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

      {/* Tabla de Tickets */}
      <div className="flex-1 overflow-auto p-2 sm:p-4 md:p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">#</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Fecha</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tipo</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Cliente</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Pago</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-2 sm:px-6 py-8 sm:py-12 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Sin tickets
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap font-mono font-semibold text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                        #{ticket.ticketNumber}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 text-xs hidden sm:table-cell">
                        {new Date(ticket.createdAt).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          ticket.orderType === 'table' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                          ticket.orderType === 'delivery' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                          'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        }`}>
                          {ticket.orderType === 'table' ? '🛎' : ticket.orderType === 'delivery' ? '🏍' : '🛍'}
                        </span>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 text-xs hidden md:table-cell">
                        {ticket.customer?.name || '-'}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          ticket.paymentType === 'cash' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                          ticket.paymentType === 'card' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                          ticket.paymentType === 'transfer' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}>
                          {ticket.paymentType === 'cash' ? 'Efectivo' : 
                           ticket.paymentType === 'card' ? 'Tarjeta' :
                           ticket.paymentType === 'transfer' ? (
                             ticket.transferType === 'nequi' ? 'Nequi' : 
                             ticket.transferType === 'bancolombia' ? 'Bancolombia' : 
                             'Transferencia'
                           ) :
                           ticket.paymentType || 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right font-bold text-gray-800 dark:text-white text-xs sm:text-sm">
                        {formatCurrency(ticket.total)}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-center flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewTicket(ticket)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center"
                        >
                          <Printer size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTicket(ticket)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 inline-flex items-center"
                          title="Eliminar ticket"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
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
