import React, { useState, useMemo } from 'react';
import { useTickets } from '../context/TicketContext';
import { useSettings } from '../context/SettingsContext';
import { Search, RefreshCw, Truck, ChevronDown, ChevronUp, Printer, Check, BookOpen, X } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import DeliveryStatusSelector from '../components/deliveries/DeliveryStatusSelector';

// Modal para asignar domiciliario
const DomiAssignModal = ({ ticketId, domiName: initialDomiName, onSave, onClose }) => {
  const [domiName, setDomiName] = useState(initialDomiName || '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen size={20} />
            Asignar Domiciliario
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>
        <input
          type="text"
          placeholder="Nombre del domiciliario"
          value={domiName}
          onChange={(e) => setDomiName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4 text-sm focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={() => {
              onSave(domiName);
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
          >
            Guardar
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente para fila de escritorio (grid de 12 columnas)
const DeliveryRowDesktop = ({ ticket, onUpdateField, onMarkDelivered, onPrintGuide }) => {
  const [showDomiModal, setShowDomiModal] = useState(false);
  const deliveryData = ticket.deliveryData || ticket.customer || {};
  const status = ticket.deliveryStatus || 'pending';
  
  // Lógica de cálculo de cobro/pago
  const calculatePaymentInfo = () => {
    const pago_efectivo = parseFloat(ticket.pago_efectivo) || 0;
    const pago_digital = parseFloat(ticket.pago_digital) || 0;
    const total = parseFloat(ticket.total) || 0;
    const deliveryCost = parseFloat(ticket.deliveryCost) || 0;
    
    const totalPaid = pago_efectivo + pago_digital;
    const pendingAmount = total - totalPaid;
    
    if (pendingAmount > 0) {
      return {
        label: '⏳ Pendiente',
        amount: pendingAmount,
        color: 'bg-yellow-50 dark:bg-yellow-900/20',
        textColor: 'text-yellow-700 dark:text-yellow-300',
        paymentType: 'pending'
      };
    } else if (pago_efectivo > 0) {
      // Si pagó en efectivo, el domiciliario recibe la diferencia después de descuentos
      const domiAmount = deliveryCost > 0 ? pago_efectivo - deliveryCost : pago_efectivo;
      return {
        label: '💵 Paga Domi',
        amount: domiAmount,
        color: 'bg-green-100 dark:bg-green-900/40',
        textColor: 'text-green-700 dark:text-green-300',
        paymentType: 'paga_domi'
      };
    } else {
      // Si pagó digital, la empresa cobra
      return {
        label: '🏢 Paga Empresa',
        amount: total,
        color: 'bg-red-100 dark:bg-red-900/40',
        textColor: 'text-red-700 dark:text-red-300',
        paymentType: 'paga_empresa'
      };
    }
  };
  
  const paymentInfo = calculatePaymentInfo();
  
  // Verificar si está esperando pago del domi
  const domiName = ticket.domiName || null;
  const domiPaid = ticket.domiPaid || false;
  const isWaitingDomiPayment = domiName && !domiPaid;
  
  const statusConfig = {
    'solicitar-domi': { label: '🚨 Solicitar Domi', color: 'bg-red-50 dark:bg-red-900/20', textColor: 'text-red-700 dark:text-red-300' },
    'en-camino': { label: '🛵 En camino', color: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-700 dark:text-blue-300' },
    'delivered': { label: '✅ Entregado', color: 'bg-green-50 dark:bg-green-900/20', textColor: 'text-green-700 dark:text-green-300' },
    'cancelled': { label: '❌ Cancelado', color: 'bg-gray-50 dark:bg-gray-800', textColor: 'text-gray-700 dark:text-gray-300' },
  };
  
  const statusInfo = statusConfig[status] || statusConfig['solicitar-domi'];

  return (
    <>
      {showDomiModal && (
        <DomiAssignModal
          ticketId={ticket.id}
          domiName={domiName}
          onSave={(name) => {
            onUpdateField(ticket.id, 'domiName', name);
            onUpdateField(ticket.id, 'domiPaid', false);
          }}
          onClose={() => setShowDomiModal(false)}
        />
      )}
      <div className={`grid grid-cols-12 gap-1 px-2 py-2 border-b border-gray-200 dark:border-gray-700 items-center transition-colors text-xs ${
        isWaitingDomiPayment 
          ? 'bg-yellow-200 dark:bg-yellow-900/50 animate-pulse hover:bg-yellow-200 dark:hover:bg-yellow-900/50' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
      }`}>
        {/* TICKET - col-span-1 */}
        <div className="col-span-1 text-center font-semibold text-gray-900 dark:text-white truncate">
          {ticket.ticketNumber}
        </div>

        {/* CLIENTE - col-span-2 */}
        <div className="col-span-2 text-center truncate text-gray-900 dark:text-white font-medium">
          {deliveryData.name || 'N/A'}
        </div>

        {/* TELÉFONO - col-span-1 */}
        <div className="col-span-1 text-center truncate text-gray-600 dark:text-gray-400">
          {deliveryData.phone || 'N/A'}
        </div>

        {/* DIRECCIÓN - col-span-2 */}
        <div className="col-span-2 text-center truncate text-gray-600 dark:text-gray-400">
          {deliveryData.address || 'N/A'}
        </div>

        {/* ESTADO - col-span-3 */}
        <div className="col-span-3 flex justify-center">
          <div className="w-full">
            <DeliveryStatusSelector
              ticketId={ticket.id}
              ticketNumber={ticket.ticketNumber}
              currentStatus={status}
              deliveryData={deliveryData}
              onStatusChange={(ticketId, newStatus) => {
                onUpdateField(ticket.id, 'deliveryStatus', newStatus);
              }}
            />
          </div>
        </div>

        {/* PAGOS - col-span-1 */}
        <div className={`col-span-1 text-center rounded px-1 py-1 ${paymentInfo.color} font-semibold ${paymentInfo.textColor}`}>
          ${paymentInfo.amount.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
        </div>

        {/* ACCIONES - col-span-1 */}
        <div className="col-span-1 flex items-center justify-center gap-0.5">
          <button
            onClick={() => onPrintGuide(ticket)}
            className="p-1 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
            title="Imprimir guía"
          >
            <Printer size={14} />
          </button>
          
          <button
            onClick={() => {
              if (isWaitingDomiPayment) {
                // Confirmar pago del domi
                onUpdateField(ticket.id, 'domiPaid', true);
              } else {
                // Abrir modal para asignar domi
                setShowDomiModal(true);
              }
            }}
            className={`p-1 rounded transition-colors ${
              isWaitingDomiPayment
                ? 'text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30'
                : 'text-gray-600 dark:text-gray-400 hover:bg-amber-100 dark:hover:bg-amber-900/30'
            }`}
            title={isWaitingDomiPayment ? 'Confirmar pago del domi' : 'Asignar domiciliario'}
          >
            <BookOpen size={14} />
          </button>
          
          {status !== 'delivered' && (
            <button
              onClick={() => onMarkDelivered(ticket.id)}
              className="p-1 text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
              title="Marcar como entregado"
            >
              <Check size={14} />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

// Componente para fila móvil (cards)
const DeliveryRowMobile = ({ ticket, onUpdateField, onMarkDelivered, onPrintGuide }) => {
  const [expanded, setExpanded] = useState(false);
  const deliveryData = ticket.deliveryData || ticket.customer || {};
  const status = ticket.deliveryStatus || 'pending';

  // Lógica de cálculo de cobro/pago (igual que desktop)
  const calculatePaymentInfo = () => {
    const pago_efectivo = parseFloat(ticket.pago_efectivo) || 0;
    const pago_digital = parseFloat(ticket.pago_digital) || 0;
    const total = parseFloat(ticket.total) || 0;
    const deliveryCost = parseFloat(ticket.deliveryCost) || 0;
    
    const totalPaid = pago_efectivo + pago_digital;
    const pendingAmount = total - totalPaid;
    
    if (pendingAmount > 0) {
      return {
        label: '⏳ Pendiente de Pago',
        amount: pendingAmount,
        color: 'bg-yellow-100 dark:bg-yellow-900/30'
      };
    } else if (pago_efectivo > 0) {
      const domiAmount = deliveryCost > 0 ? pago_efectivo - deliveryCost : pago_efectivo;
      return {
        label: '💵 Paga Domi',
        amount: domiAmount,
        color: 'bg-green-100 dark:bg-green-900/30'
      };
    } else {
      return {
        label: '🏢 Paga Empresa',
        amount: total,
        color: 'bg-blue-100 dark:bg-blue-900/30'
      };
    }
  };
  
  const paymentInfo = calculatePaymentInfo();

  const statusConfig = {
    'solicitar-domi': { label: '🚨 Solicitar Domi', color: 'bg-red-100 dark:bg-red-900/30' },
    'en-camino': { label: '🛵 En camino', color: 'bg-blue-100 dark:bg-blue-900/30' },
    'delivered': { label: '✅ Entregado', color: 'bg-green-100 dark:bg-green-900/30' },
    'cancelled': { label: '❌ Cancelado', color: 'bg-gray-100 dark:bg-gray-700' },
  };

  const statusInfo = statusConfig[status] || statusConfig['solicitar-domi'];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      {/* Header de Card */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Ticket #{ticket.ticketNumber}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {deliveryData.name || 'Cliente sin nombre'}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* Info Básica */}
      <div className="space-y-2 mb-3 text-sm">
        <p className="text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-900 dark:text-white">Teléfono:</span> {deliveryData.phone || 'N/A'}
        </p>
        <div className={`rounded p-2 ${paymentInfo.color}`}>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{paymentInfo.label}</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            ${paymentInfo.amount.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Botón Expandir */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-2 rounded bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors mb-3"
      >
        <span>Detalles</span>
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {/* Detalles Expandidos */}
      {expanded && (
        <div className="space-y-3 mb-3 pb-3 border-b border-gray-200 dark:border-gray-600">
          {/* Dirección */}
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">DIRECCIÓN</p>
            <p className="text-sm text-gray-900 dark:text-white">{deliveryData.address || 'N/A'}</p>
            {deliveryData.references && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Refs: {deliveryData.references}
              </p>
            )}
          </div>

          {/* Items */}
          {ticket.items && ticket.items.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">ITEMS</p>
              <ul className="space-y-1">
                {ticket.items.map((item, idx) => (
                  <li key={idx} className="text-xs text-gray-700 dark:text-gray-300">
                    {item.quantity}x {item.name}
                    {item.notes && <span className="text-gray-500 dark:text-gray-400"> - {item.notes}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Estado Select */}
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">CAMBIAR ESTADO</p>
            <select
              value={status}
              onChange={(e) => onUpdateField(ticket.id, 'deliveryStatus', e.target.value)}
              className="w-full px-3 py-2 rounded text-xs font-medium border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="solicitar-domi">🚨 Solicitar Domi</option>
              <option value="en-camino">🛵 En camino</option>
              <option value="delivered">✅ Entregado</option>
              <option value="cancelled">❌ Cancelado</option>
            </select>
          </div>
        </div>
      )}

      {/* Botones de Acción */}
      <div className="flex gap-2">
        <button
          onClick={() => onPrintGuide(ticket)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
        >
          <Printer size={16} />
          Imprimir
        </button>
        {status !== 'delivered' && (
          <button
            onClick={() => onMarkDelivered(ticket.id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
          >
            <Check size={16} />
            Entregar
          </button>
        )}
      </div>
    </div>
  );
};

// Componente Principal
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
      // ✅ IMPORTANTE: También marcar la orden como completada para que desaparezca del tablero
      await handleUpdateField(ticketId, 'status', 'completed');
      console.log('✅ Pedido marcado como entregado y completado');
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

      {/* Contenido - Responsive */}
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
            {/* DESKTOP VIEW (lg+) - Tabla con Grid 12 columnas */}
            <div className="hidden lg:block">
              {/* Header */}
              <div className="sticky top-0 bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 z-10">
                <div className="grid grid-cols-12 gap-1 px-2 py-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                  <div className="col-span-1 text-center">TKT</div>
                  <div className="col-span-2 text-center">CLIENTE</div>
                  <div className="col-span-1 text-center">TEL</div>
                  <div className="col-span-2 text-center">DIRECCIÓN</div>
                  <div className="col-span-3 text-center">ESTADO</div>
                  <div className="col-span-1 text-center">PAGOS</div>
                  <div className="col-span-1 text-center">ACT</div>
                </div>
              </div>

              {/* Filas */}
              <div>
                {filteredOrders.map(ticket => (
                  <DeliveryRowDesktop
                    key={ticket.id}
                    ticket={ticket}
                    onUpdateField={handleUpdateField}
                    onMarkDelivered={handleMarkDelivered}
                    onPrintGuide={handlePrintGuide}
                  />
                ))}
              </div>
            </div>

            {/* MOBILE VIEW (<lg) - Cards */}
            <div className="lg:hidden">
              {filteredOrders.map(ticket => (
                <DeliveryRowMobile
                  key={ticket.id}
                  ticket={ticket}
                  onUpdateField={handleUpdateField}
                  onMarkDelivered={handleMarkDelivered}
                  onPrintGuide={handlePrintGuide}
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
