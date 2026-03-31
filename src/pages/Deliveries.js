import React, { useState, useMemo } from 'react';
import { useTickets } from '../context/TicketContext';
import { useSettings } from '../context/SettingsContext';
import { Search, Filter, RefreshCw, Truck, CheckCircle, Clock } from 'lucide-react';
import DeliveryRow from '../components/deliveries/DeliveryRow';
import { formatCurrency } from '../utils/formatters';

const Deliveries = () => {
  const { tickets, updateTicket } = useTickets();
  const { settings } = useSettings();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('today');
  const [loading, setLoading] = useState(false);

  // Filtrar solo pedidos de domicilio
  const deliveryOrders = useMemo(() => 
    tickets.filter(ticket => 
      ticket.type === 'delivery' || 
      ticket.orderType === 'delivery' ||
      (ticket.customer && ticket.deliveryData)
    ),
    [tickets]
  );

  // Aplicar filtros
  const filteredOrders = useMemo(() => {
    return deliveryOrders.filter(ticket => {
      const deliveryData = ticket.deliveryData || ticket.customer || {};
      
      // Filtro de búsqueda
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        ticket.ticketNumber?.toLowerCase().includes(searchLower) ||
        deliveryData.name?.toLowerCase().includes(searchLower) ||
        deliveryData.phone?.includes(searchQuery) ||
        deliveryData.address?.toLowerCase().includes(searchLower);
      
      // Filtro de estado
      const status = ticket.deliveryStatus || 'pending';
      const matchesStatus = filterStatus === 'all' || status === filterStatus;
      
      // Filtro de fecha
      const ticketDate = new Date(ticket.createdAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let matchesDate = true;
      if (filterDate === 'today') {
        const ticketDateNormalized = new Date(ticketDate);
        ticketDateNormalized.setHours(0, 0, 0, 0);
        matchesDate = ticketDateNormalized.getTime() === today.getTime();
      } else if (filterDate === 'yesterday') {
        const ticketDateNormalized = new Date(ticketDate);
        ticketDateNormalized.setHours(0, 0, 0, 0);
        matchesDate = ticketDateNormalized.getTime() === yesterday.getTime();
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [deliveryOrders, searchQuery, filterStatus, filterDate]);

  // Actualizar campo de pedido
  const handleUpdateField = async (ticketId, field, value) => {
    setLoading(true);
    try {
      const result = await updateTicket(ticketId, { [field]: value });
      console.log(`✅ ${field} actualizado a:`, value);
      return result;
    } catch (error) {
      console.error('❌ Error updating ticket:', error);
      throw new Error(error.message || 'Error al actualizar en la nube');
    } finally {
      setLoading(false);
    }
  };

  // Marcar como entregado
  const handleMarkDelivered = async (ticketId) => {
    if (window.confirm('¿Confirmar que este pedido fue entregado?')) {
      await handleUpdateField(ticketId, 'deliveryStatus', 'delivered');
      await handleUpdateField(ticketId, 'deliveredAt', new Date().toISOString());
    }
  };

  // Imprimir guía de despacho
  const handlePrintGuide = (ticket) => {
    const deliveryData = ticket.deliveryData || ticket.customer || {};
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Guía de Despacho - ${ticket.ticketNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 14px; margin: 0; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin-bottom: 15px; }
            .label { font-weight: bold; display: inline-block; width: 120px; }
            .status { font-size: 18px; font-weight: bold; color: #22c55e; }
            .items-list { margin-top: 10px; padding-left: 20px; }
            .items-list li { margin: 5px 0; }
            .total { font-size: 18px; font-weight: bold; margin-top: 15px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>🚴 GUÍA DE DESPACHO</h2>
            <p>Ticket: ${ticket.ticketNumber}</p>
            <p>Fecha: ${new Date(ticket.createdAt).toLocaleString('es-CO')}</p>
          </div>
          
          <div class="section">
            <p><span class="label">Cliente:</span> ${deliveryData.name || 'N/A'}</p>
            <p><span class="label">Teléfono:</span> ${deliveryData.phone || 'N/A'}</p>
            <p><span class="label">Dirección:</span> ${deliveryData.address || 'N/A'}</p>
            ${deliveryData.references ? `<p><span class="label">Referencias:</span> ${deliveryData.references}</p>` : ''}
          </div>
          
          <div class="section">
            <p><span class="label">Repartidor:</span> ${deliveryData.rider || 'Pendiente'}</p>
            <p><span class="label">Hora Estimada:</span> ${ticket.estimatedDeliveryTime || 'N/A'}</p>
            <p><span class="label">Estado:</span> <span class="status">${ticket.deliveryStatus === 'delivered' ? '✅ Entregado' : ticket.deliveryStatus === 'en-camino' ? '🛵 En camino' : ticket.deliveryStatus === 'solicitar-domi' ? '🚨 Solicitar Domi' : '❌ Cancelado'}</span></p>
          </div>
          
          <div class="section">
            <p><strong>Pedidos:</strong></p>
            <ul class="items-list">
              ${ticket.items?.map(item => `
                <li>${item.quantity}x ${item.name} ${item.notes ? `- Nota: ${item.notes}` : ''}</li>
              `).join('') || '<li>Sin items</li>'}
            </ul>
          </div>
          
          <div class="section total">
            <p>Total: $${(ticket.total || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}</p>
            <p>Pago: ${ticket.paymentType || 'No especificado'}</p>
          </div>
          
          <div class="no-print" style="margin-top: 30px; text-align: center; gap: 10px;">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; cursor: pointer; background: #3b82f6; color: white; border: none; border-radius: 5px; margin-right: 10px;">🖨️ Imprimir</button>
            <button onclick="window.close()" style="padding: 10px 20px; font-size: 14px; cursor: pointer; background: #ef4444; color: white; border: none; border-radius: 5px;">❌ Cerrar</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Truck className="text-blue-600 dark:text-blue-400" size={28} />
              Gestión de Domicilios
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {filteredOrders.length} pedidos de {deliveryOrders.length} totales
            </p>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors self-start sm:self-auto"
          >
            <RefreshCw size={18} />
            Actualizar
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por ticket, nombre, teléfono, dirección..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          
          {/* Filtro Estado */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="solicitar-domi">🚨 Solicitar Domi</option>
            <option value="en-camino">🛵 En camino</option>
            <option value="delivered">✅ Entregado</option>
            <option value="cancelled">❌ Cancelado</option>
          </select>
          
          {/* Filtro Fecha */}
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="today">Hoy</option>
            <option value="yesterday">Ayer</option>
            <option value="all">Todos</option>
          </select>
        </div>
      </div>

      {/* Lista de Pedidos - Tabla Compacta */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-800">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No hay pedidos de domicilio
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Los pedidos aparecerán aquí cuando se creen con tipo "Domicilio"
            </p>
          </div>
        ) : (
          <div>
            {/* Header de Tabla */}
            <div className="sticky top-0 bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 z-10">
              <div className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 overflow-x-auto">
                <div className="w-20 flex-shrink-0 text-center">TICKET</div>
                <div className="w-40 flex-shrink-0">CLIENTE</div>
                <div className="w-32 flex-shrink-0">TELÉFONO</div>
                <div className="w-48 flex-shrink-0">DIRECCIÓN</div>
                <div className="w-56 flex-shrink-0">ESTADO</div>
                <div className="w-44 flex-shrink-0 text-center">COBRAR/PAGAR</div>
                <div className="w-24 flex-shrink-0 text-center">ACCIONES</div>
              </div>
            </div>

            {/* Filas */}
            <div>
              {filteredOrders.map(ticket => (
                <DeliveryRow
                  key={ticket.id}
                  ticket={ticket}
                  onUpdateField={handleUpdateField}
                  onMarkDelivered={handleMarkDelivered}
                  onPrintGuide={handlePrintGuide}
                  loading={loading}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Deliveries;
